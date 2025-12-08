import forgeAPI from '@/utils/forgeAPI'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoadingScreen, WithQuery } from 'lifeforge-ui'
import { createContext, useContext, useEffect, useState } from 'react'
import { type InferOutput, useParams } from 'shared'

import NewSessionScreen from '../components/NewSessionScreen'
import SessionEndedScreen from '../components/SessionEndedScreen'

export type Session = InferOutput<
  typeof forgeAPI.pomodoroTimer.sessions.getById
>

export type SubSession = NonNullable<
  InferOutput<typeof forgeAPI.pomodoroTimer.subSessions.getCurrent>
>

interface CurrentSessionContext {
  session: Session
  subSession: Omit<
    SubSession,
    'created' | 'collectionId' | 'collectionName' | 'session' | 'ended'
  >
  setSubSession: (subSession: CurrentSessionContext['subSession']) => void
  changeStatus: (
    newStatus: Session['status'],
    timeLeft?: number
  ) => Promise<void>
}

const CurrentSessionContext = createContext<CurrentSessionContext | null>(null)

function CurrentSessionProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient()

  const { sessionId } = useParams<{ sessionId: string }>()

  const [firstLoad, setFirstLoad] = useState(true)

  const [subSession, setSubSession] = useState<
    CurrentSessionContext['subSession'] | null
  >(null)

  // Reset state when sessionId changes to prevent stale cached data
  useEffect(() => {
    setFirstLoad(true)
    setSubSession(null)
  }, [sessionId])

  const createSubSessionMutation = useMutation(
    forgeAPI.pomodoroTimer.subSessions.create.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: forgeAPI.pomodoroTimer.sessions.getById.key
        })

        qc.invalidateQueries({
          queryKey:
            forgeAPI.pomodoroTimer.subSessions.getCurrent.queryOptions()
              .queryKey
        })
      }
    })
  )

  const changeStatusMutation = useMutation(
    forgeAPI.pomodoroTimer.sessions.changeStatus
      .input({
        id: sessionId || ''
      })
      .mutationOptions({
        onSuccess: data => {
          qc.invalidateQueries({
            queryKey: forgeAPI.pomodoroTimer.sessions.list.key
          })

          qc.setQueryData(
            forgeAPI.pomodoroTimer.sessions.getById.input({
              id: sessionId || ''
            }).key,
            data
          )
        }
      })
  )

  const sessionQuery = useQuery(
    forgeAPI.pomodoroTimer.sessions.getById
      .input({
        id: sessionId || ''
      })
      .queryOptions({})
  )

  const subSessionQuery = useQuery(
    forgeAPI.pomodoroTimer.subSessions.getCurrent
      .input({
        sessionId: sessionId || ''
      })
      .queryOptions({})
  )

  async function handleChangeStatus(
    newStatus: Session['status'],
    timeLeft?: number
  ) {
    if (newStatus !== 'completed') {
      changeStatusMutation.mutateAsync({
        status: newStatus
      })

      return
    }

    if (!sessionQuery.data || !subSession || timeLeft === undefined) {
      return
    }

    const endedTimestamp = new Date().toISOString()

    await changeStatusMutation.mutateAsync({
      status: 'completed',
      subSessionId: subSession.id,
      subSessionEndedTimestamp: endedTimestamp,
      subSessionDurationElapsed:
        sessionQuery.data[
          (
            {
              work: 'work_duration',
              short_break: 'short_break_duration',
              long_break: 'long_break_duration'
            } as const
          )[subSession.type]
        ] *
          60 -
        timeLeft
    })
  }

  useEffect(() => {
    if (
      !sessionQuery.data ||
      subSessionQuery.data === undefined ||
      sessionQuery.data.status === 'new'
    ) {
      return
    }

    setFirstLoad(false)

    if (subSessionQuery.data) {
      setSubSession({
        id: subSessionQuery.data.id,
        type: subSessionQuery.data.type,
        is_completed: subSessionQuery.data.is_completed,
        duration_elapsed: subSessionQuery.data.duration_elapsed
      })

      return
    }

    if (!firstLoad) {
      return
    }

    const newSessionType =
      sessionQuery.data.lastSubSessionType === 'work'
        ? sessionQuery.data.pomodoro_count %
            sessionQuery.data.session_until_long_break ===
          0
          ? 'long_break'
          : 'short_break'
        : 'work'

    createSubSessionMutation.mutate({
      sessionId: sessionQuery.data.id,
      type: newSessionType
    })
  }, [sessionQuery.data, subSessionQuery.data])

  useEffect(() => {
    return () => {
      setFirstLoad(true)
      setSubSession(null)
    }
  }, [])

  return (
    <WithQuery query={sessionQuery}>
      {session => {
        if (session.status === 'new') {
          return (
            <NewSessionScreen
              changeStatusMutation={changeStatusMutation}
              session={session}
            />
          )
        }

        if (session.status === 'completed') {
          return <SessionEndedScreen session={session} />
        }

        if (!subSession) {
          return <LoadingScreen />
        }

        return (
          <CurrentSessionContext
            value={{
              session,
              subSession,
              setSubSession,
              changeStatus: handleChangeStatus
            }}
          >
            {children}
          </CurrentSessionContext>
        )
      }}
    </WithQuery>
  )
}

export default CurrentSessionProvider

export function useCurrentSession() {
  const context = useContext(CurrentSessionContext)

  if (context === null) {
    throw new Error(
      'useCurrentSession must be used within a CurrentSessionProvider'
    )
  }

  return context
}
