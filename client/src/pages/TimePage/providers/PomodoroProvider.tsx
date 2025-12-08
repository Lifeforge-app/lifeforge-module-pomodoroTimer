import { useCurrentSession } from '@/pages/TimePage/providers/CurrentSessionProvider'
import forgeAPI from '@/utils/forgeAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { usePomodoroSettings } from '../../../providers/PomodoroSettingsProvider'

export type SubSessionType = 'work' | 'short_break' | 'long_break'

interface TimerState {
  timeLeft: number
  isRunning: boolean
  subSessionType: SubSessionType
  pomodoroCount: number
  sessionKey: number // Increments on each session to force effect re-run
}

interface PomodoroContext extends TimerState {
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => Promise<void>
}

const PomodoroContext = createContext<PomodoroContext | null>(null)

function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()

  const settings = usePomodoroSettings()

  const currentSession = useCurrentSession()

  const completeAndStartNewSubSessionMutation = useMutation(
    forgeAPI.pomodoroTimer.subSessions.completeAndStartNew.mutationOptions({
      onSuccess: data => {
        currentSession.setSubSession(data)

        qc.invalidateQueries({
          queryKey: ['pomodoroTimer']
        })
      }
    })
  )

  const [state, _setState] = useState<TimerState>({
    timeLeft:
      currentSession.session[
        (
          {
            work: 'work_duration',
            short_break: 'short_break_duration',
            long_break: 'long_break_duration'
          } as const
        )[currentSession.subSession.type]
      ] *
        60 -
      currentSession.subSession.duration_elapsed,
    isRunning: false,
    subSessionType: currentSession.subSession.type,
    pomodoroCount: currentSession.session.pomodoro_count,
    sessionKey: 0
  })

  const stateRef = useRef(state)

  const setState = useCallback((newState: SetStateAction<TimerState>) => {
    stateRef.current =
      typeof newState === 'function'
        ? { ...stateRef.current, ...newState(stateRef.current) }
        : { ...stateRef.current, ...newState }
    _setState(stateRef.current)
  }, [])

  const intervalRef = useRef<number | null>(null)

  const start = useCallback(() => {
    if (state.isRunning) return

    setState(prev => ({ ...prev, isRunning: true }))
  }, [state.isRunning])

  const pause = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setState(prev => ({ ...prev, isRunning: false }))
  }, [])

  const reset = useCallback(() => {
    if (state.isRunning) {
      return
    }

    const duration =
      currentSession.session[
        (
          {
            work: 'work_duration',
            short_break: 'short_break_duration',
            long_break: 'long_break_duration'
          } as const
        )[state.subSessionType]
      ] * 60

    setState(prev => ({ ...prev, timeLeft: duration }))
  }, [pause, state.subSessionType])

  const nextSession = useCallback(
    async (
      currentState: TimerState,
      autoStart: boolean,
      isFinished: boolean
    ) => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      let newType: SubSessionType
      let newPomodoros = currentState.pomodoroCount

      if (currentState.subSessionType === 'work') {
        // When finishing a work session
        newPomodoros += 1

        if (
          newPomodoros % currentSession.session.session_until_long_break ===
          0
        ) {
          newType = 'long_break'
        } else {
          newType = 'short_break'
        }
      } else {
        // When finishing a break session
        newType = 'work'
      }

      const duration =
        currentSession.session[
          (
            {
              work: 'work_duration',
              short_break: 'short_break_duration',
              long_break: 'long_break_duration'
            } as const
          )[currentState.subSessionType]
        ] * 60

      // Record completion of current sub-session
      await completeAndStartNewSubSessionMutation.mutateAsync({
        durationElapsed: isFinished
          ? duration
          : duration - currentState.timeLeft,
        nextSessionType: newType,
        sessionId: currentSession.session.id,
        endedTimestamp: new Date().toISOString()
      })

      setState({
        timeLeft:
          currentSession.session[
            (
              {
                work: 'work_duration',
                short_break: 'short_break_duration',
                long_break: 'long_break_duration'
              } as const
            )[newType]
          ] * 60,
        isRunning: autoStart,
        subSessionType: newType,
        pomodoroCount: newPomodoros,
        sessionKey: stateRef.current.sessionKey + 1
      })
    },
    [currentSession]
  )

  const skip = useCallback(async () => {
    if (
      state.isRunning ||
      state.timeLeft === 0 ||
      state.subSessionType === 'work'
    ) {
      return
    }

    // Stop the timer immediately
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setState(prev => ({ ...prev, isRunning: false }))

    // Auto-start the next work session
    await nextSession(state, settings.auto_start_work ?? false, false)
  }, [state, nextSession])

  // Timer tick effect
  useEffect(() => {
    // Always clear any existing interval first
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (state.isRunning) {
      intervalRef.current = window.setInterval(async () => {
        if (stateRef.current.timeLeft === 0) {
          // Play notification sound
          const audio = new Audio(
            forgeAPI.media.input({
              collectionId: settings.collectionId,
              recordId: settings.id,
              fieldId: settings.notification_sound
            }).endpoint
          )

          await audio.play().catch(() => {})

          const shouldAutoStart =
            stateRef.current.subSessionType === 'work'
              ? settings.auto_start_break
              : settings.auto_start_work

          await nextSession(stateRef.current, shouldAutoStart ?? false, true)

          return
        }

        setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isRunning, state.sessionKey, settings, nextSession])

  return (
    <PomodoroContext
      value={{
        ...state,
        start,
        pause,
        reset,
        skip
      }}
    >
      {children}
    </PomodoroContext>
  )
}

export default PomodoroProvider

export function usePomodoro() {
  const context = useContext(PomodoroContext)

  if (context === null) {
    throw new Error('usePomodoro must be used within a PomodoroProvider')
  }

  return context
}
