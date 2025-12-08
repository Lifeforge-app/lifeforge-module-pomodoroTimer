import { useSessionStyles } from '@/hooks/useSessionStyles'
import { useCurrentSession } from '@/providers/CurrentSessionProvider'
import { usePomodoro } from '@/providers/PomodoroProvider'
import formatTime from '@/utils/formatTime'
import { type LocalSubSession } from '@/utils/localStorage'
import { Icon } from '@iconify/react'
import { Button, Card, Scrollbar } from 'lifeforge-ui'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import StatsCard from './Timer/components/StatsCard'

interface Cycle {
  cycleNumber: number
  subSessions: LocalSubSession[]
}

function SessionEndedScreen({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('apps.pomodoroTimer')

  const sessionStyles = useSessionStyles()

  const currentSession = useCurrentSession()

  const timer = usePomodoro()

  const session = currentSession ? currentSession.session : null

  // Group subsessions by cycle
  const cycles = useMemo(() => {
    if (!session) return []

    const result: Cycle[] = []

    let currentCycle: Cycle = { cycleNumber: 1, subSessions: [] }

    for (const subSession of timer.subSessions) {
      currentCycle.subSessions.push(subSession)

      // After a long break, start new cycle
      if (subSession.type === 'long_break') {
        result.push(currentCycle)
        currentCycle = {
          cycleNumber: currentCycle.cycleNumber + 1,
          subSessions: []
        }
      }
    }

    // Push remaining cycle if it has subsessions
    if (currentCycle.subSessions.length > 0) {
      result.push(currentCycle)
    }

    return result
  }, [timer.subSessions, session])

  const totalBreakTime = useMemo(() => {
    return timer.subSessions
      .filter(s => s.type !== 'work')
      .reduce((sum, s) => sum + s.duration_elapsed, 0)
  }, [timer.subSessions])

  if (!session) return null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-center flex flex-col px-4 pt-8 text-center">
        <Icon className="text-bg-500 size-16" icon="tabler:clock-check" />
        <h2 className="mt-6 mb-2 text-2xl font-medium">
          {t('timer.sessionCompleted')}
        </h2>
        <p className="text-bg-500">
          {t('timer.sessionCompletedDesc', { name: session.name })}
        </p>

        {/* Summary stats using StatsCard */}
        <StatsCard breakTime={totalBreakTime} session={session} />
      </div>

      {/* Cycles list */}
      <Scrollbar className="mt-6 flex-1 px-4">
        <div className="space-y-4 pb-4">
          {cycles.map(cycle => (
            <Card key={cycle.cycleNumber} className="p-4">
              <h3 className="mb-3 text-xl font-medium">
                {t('timer.cycleCount', { current: cycle.cycleNumber })}
              </h3>
              <div className="space-y-2">
                {cycle.subSessions.map((subSession, idx) => (
                  <Card
                    key={idx}
                    className="component-bg-lighter! flex items-center gap-3"
                  >
                    <div
                      className="rounded-lg p-2"
                      style={{
                        backgroundColor:
                          sessionStyles[subSession.type].color + '20'
                      }}
                    >
                      <Icon
                        className="size-5"
                        icon={sessionStyles[subSession.type].icon}
                        style={{ color: sessionStyles[subSession.type].color }}
                      />
                    </div>
                    <span className="flex-1 font-medium">
                      {subSession.type === 'work'
                        ? 'Work'
                        : subSession.type === 'short_break'
                          ? 'Short Break'
                          : 'Long Break'}
                    </span>
                    <p>
                      <span className="font-medium">
                        {formatTime(subSession.duration_elapsed)}
                      </span>
                      <span className="text-bg-500 text-sm">
                        {' '}
                        /{' '}
                        {formatTime(
                          session[
                            (
                              {
                                work: 'work_duration',
                                short_break: 'short_break_duration',
                                long_break: 'long_break_duration'
                              } as const
                            )[subSession.type]
                          ] * 60
                        )}
                      </span>
                    </p>
                    {subSession.is_completed ? (
                      <Icon
                        className="size-4 text-green-500"
                        icon="tabler:check"
                      />
                    ) : (
                      <Icon
                        className="text-bg-400 size-4"
                        icon="tabler:skip-forward"
                      />
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Scrollbar>

      <div className="p-4">
        <Button
          className="w-full"
          icon="tabler:arrow-right"
          iconPosition="end"
          variant="secondary"
          onClick={onClose}
        >
          Proceed
        </Button>
      </div>
    </div>
  )
}

export default SessionEndedScreen
