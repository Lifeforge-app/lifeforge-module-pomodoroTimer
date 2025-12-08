import SESSION_STYLES from '@/constants/session_styles'
import CurrentSessionProvider, {
  useCurrentSession
} from '@/pages/TimePage/providers/CurrentSessionProvider'
import PomodoroSettingsProvider from '@/providers/PomodoroSettingsProvider'
import { Icon } from '@iconify/react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {
  Button,
  ConfirmationModal,
  GoBackButton,
  useModalStore
} from 'lifeforge-ui'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'shared'

import PomodoroProvider, { usePomodoro } from './providers/PomodoroProvider'
import SessionValidityProvider from './providers/SessionValidityProvider'

dayjs.extend(duration)

function Timer() {
  const { t } = useTranslation('apps.pomodoroTimer')

  const open = useModalStore(state => state.open)

  const navigate = useNavigate()

  const timer = usePomodoro()

  const currentSession = useCurrentSession()

  const totalDuration =
    currentSession.session[
      (
        {
          work: 'work_duration',
          short_break: 'short_break_duration',
          long_break: 'long_break_duration'
        } as const
      )[timer.subSessionType]
    ] * 60

  const progress = ((totalDuration - timer.timeLeft) / totalDuration) * 100

  const sessionsUntilLongBreak =
    currentSession.session.session_until_long_break ?? 4

  const currentPomodoroInCycle = timer.pomodoroCount % sessionsUntilLongBreak

  const getMessage = () => {
    if (timer.subSessionType === 'work') {
      if (!timer.isRunning) return t('timer.messages.readyToFocus')
      if (timer.isRunning) return t('timer.messages.stayFocused')

      return t('timer.messages.paused')
    }

    return t('timer.messages.takeBreak')
  }

  function handleStopSession() {
    open(ConfirmationModal, {
      title: t('modals.endSession.title'),
      description: t('modals.endSession.description', {
        sessionName: currentSession.session.name
      }),
      onConfirm: async () => {
        await currentSession.changeStatus('completed', timer.timeLeft)
      }
    })
  }

  return (
    <>
      <div className="flex-between mt-2">
        <div>
          <GoBackButton
            onClick={() => {
              navigate(-1)
            }}
          />
          <div>
            <h1 className="text-2xl font-medium">
              {currentSession.session.name}
            </h1>
            <p className="text-bg-500 text-sm">
              {t('timer.sessionConfig', {
                durations: `${currentSession.session.work_duration} / ${currentSession.session.short_break_duration} / ${currentSession.session.long_break_duration}`,
                perCycle: currentSession.session.session_until_long_break
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            disabled={timer.isRunning}
            icon="tabler:player-stop"
            namespace="apps.pomodoroTimer"
            variant="secondary"
            onClick={handleStopSession}
          >
            End Session
          </Button>
        </div>
      </div>
      <div className="flex-center flex-1 flex-col gap-6 p-8">
        <p className="text-lg font-medium">
          {t('timer.cycleCount', {
            current:
              Math.floor(
                (timer.pomodoroCount +
                  (timer.subSessionType === 'long_break' ? -1 : 0)) /
                  sessionsUntilLongBreak
              ) + 1
          })}
        </p>
        {/* Session Type Badge */}
        <div
          className="flex items-center gap-3 rounded-full py-2 pr-5 pl-2"
          style={{
            backgroundColor: SESSION_STYLES[timer.subSessionType].color + '15',
            border: `1px solid ${SESSION_STYLES[timer.subSessionType].color}40`
          }}
        >
          <div
            className="rounded-full p-1.5"
            style={{
              backgroundColor: SESSION_STYLES[timer.subSessionType].color + '30'
            }}
          >
            <Icon
              className="size-5"
              icon={SESSION_STYLES[timer.subSessionType].icon}
              style={{ color: SESSION_STYLES[timer.subSessionType].color }}
            />
          </div>
          <span
            className="text-lg font-semibold"
            style={{ color: SESSION_STYLES[timer.subSessionType].color }}
          >
            {t(`timer.${_.camelCase(timer.subSessionType)}`)}
          </span>
        </div>

        {/* Motivational Message */}
        <p className="text-bg-500">{getMessage()}</p>

        {/* Circular Progress Timer */}
        <div className="relative">
          <svg className="relative size-96 -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              className="text-bg-200 dark:text-bg-800"
              cx="100"
              cy="100"
              fill="none"
              r="85"
              stroke="currentColor"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              className="transition-all duration-300"
              cx="100"
              cy="100"
              fill="none"
              r="85"
              stroke={SESSION_STYLES[timer.subSessionType].color}
              strokeDasharray={`${(progress / 100) * 534.07} 534.07`}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-6xl font-semibold"
              style={{
                color: timer.isRunning
                  ? SESSION_STYLES[timer.subSessionType].color
                  : undefined
              }}
            >
              {dayjs.duration(timer.timeLeft, 'seconds').format('mm:ss')}
            </div>
          </div>
        </div>

        {/* Pomodoro Progress Bar */}
        <div className="flex w-full max-w-md items-center gap-1">
          {Array.from({ length: sessionsUntilLongBreak * 2 }).map((_, i) => {
            const isWorkSegment = i % 2 === 0

            const workIndex = Math.floor(i / 2)

            const restIndex = Math.floor(i / 2)

            if (isWorkSegment) {
              // Work segment
              const isCompleted =
                workIndex < currentPomodoroInCycle ||
                timer.subSessionType === 'long_break'

              const isCurrent =
                workIndex === currentPomodoroInCycle &&
                timer.subSessionType === 'work'

              const segmentProgress = isCurrent ? progress : 0

              return (
                <div
                  key={i}
                  className="bg-bg-200 dark:bg-bg-800 relative h-2 flex-[2] overflow-hidden rounded-full first:rounded-l-full"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                    style={{
                      width: isCompleted ? '100%' : `${segmentProgress}%`,
                      backgroundColor: SESSION_STYLES.work.color
                    }}
                  />
                </div>
              )
            }

            // Rest segment
            const isLongBreak = restIndex === sessionsUntilLongBreak - 1

            const breakType = isLongBreak ? 'long_break' : 'short_break'

            const adjustedRestIndex =
              (currentPomodoroInCycle - 1 + sessionsUntilLongBreak) %
              sessionsUntilLongBreak

            const isRestCompleted =
              timer.subSessionType === 'work'
                ? restIndex < currentPomodoroInCycle
                : restIndex < adjustedRestIndex

            const isRestCurrent =
              restIndex === adjustedRestIndex && timer.subSessionType !== 'work'

            const segmentProgress = isRestCurrent ? progress : 0

            return (
              <div
                key={i}
                className="bg-bg-200 dark:bg-bg-800 relative h-2 flex-1 overflow-hidden rounded-full last:rounded-r-full"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                  style={{
                    width: isRestCompleted ? '100%' : `${segmentProgress}%`,
                    backgroundColor: SESSION_STYLES[breakType].color
                  }}
                />
              </div>
            )
          })}
        </div>
        <span className="text-bg-500">
          {timer.subSessionType === 'work'
            ? t('timer.pomodoroCount', {
                current:
                  currentPomodoroInCycle +
                  (timer.subSessionType === 'work' ? 1 : 0),
                total: sessionsUntilLongBreak
              })
            : t('timer.breakingTime')}
        </span>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-3">
          {!timer.isRunning ? (
            <Button
              icon="tabler:player-play"
              namespace="apps.pomodoroTimer"
              variant="primary"
              onClick={timer.start}
            >
              start
            </Button>
          ) : (
            <Button
              icon="tabler:player-pause"
              namespace="apps.pomodoroTimer"
              variant="primary"
              onClick={timer.pause}
            >
              pause
            </Button>
          )}
          <Button
            disabled={timer.isRunning}
            icon="tabler:refresh"
            namespace="apps.pomodoroTimer"
            variant="secondary"
            onClick={timer.reset}
          >
            reset
          </Button>
          {timer.subSessionType !== 'work' && (
            <Button
              disabled={timer.isRunning}
              icon="tabler:player-skip-forward"
              namespace="apps.pomodoroTimer"
              variant="secondary"
              onClick={timer.skip}
            >
              skip
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default function TimerPage() {
  return (
    <SessionValidityProvider>
      <PomodoroSettingsProvider>
        <CurrentSessionProvider>
          <PomodoroProvider>
            <Timer />
          </PomodoroProvider>
        </CurrentSessionProvider>
      </PomodoroSettingsProvider>
    </SessionValidityProvider>
  )
}
