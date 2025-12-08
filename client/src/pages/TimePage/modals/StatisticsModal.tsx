import SESSION_STYLES from '@/constants/session_styles'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { LoadingScreen, ModalHeader, Widget } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'

import forgeAPI from '../../../utils/forgeAPI'

dayjs.extend(duration)

function StatisticsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('apps.pomodoroTimer')

  const statsQuery = useQuery({
    ...forgeAPI.pomodoroTimer.sessions.stats.queryOptions(),
    refetchInterval: 5000 // Refetch every 5 seconds
  })

  const sessionsQuery = useQuery({
    ...forgeAPI.pomodoroTimer.sessions.list.queryOptions(),
    refetchInterval: 5000 // Refetch every 5 seconds
  })

  if (statsQuery.isLoading || sessionsQuery.isLoading) {
    return <LoadingScreen />
  }

  const stats = statsQuery.data

  const recentSessions = sessionsQuery.data?.slice(0, 10) ?? []

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)

    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return t('stats.hoursMinutes', { hours, minutes })
    }

    return t('stats.minutes', { minutes })
  }

  return (
    <div className="min-w-[60vw]">
      <ModalHeader
        icon="tabler:chart-bar"
        title="Statistics"
        onClose={onClose}
      />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Today */}
          <Widget
            className="component-bg-lighter"
            icon="tabler:calendar-event"
            title={t('stats.today')}
          >
            <div className="flex flex-col gap-2">
              <div className="text-3xl font-bold">{stats?.today ?? 0}</div>
              <div className="text-bg-500 text-sm">
                {formatTime(stats?.totalFocusTimeToday ?? 0)}
              </div>
            </div>
          </Widget>

          {/* This Week */}
          <Widget
            className="component-bg-lighter"
            icon="tabler:calendar-week"
            title={t('stats.thisWeek')}
          >
            <div className="flex flex-col gap-2">
              <div className="text-3xl font-bold">{stats?.thisWeek ?? 0}</div>
              <div className="text-bg-500 text-sm">
                {formatTime(stats?.totalFocusTimeWeek ?? 0)}
              </div>
            </div>
          </Widget>

          {/* This Month */}
          <Widget
            className="component-bg-lighter"
            icon="tabler:calendar-month"
            title={t('stats.thisMonth')}
          >
            <div className="flex flex-col gap-2">
              <div className="text-3xl font-bold">{stats?.thisMonth ?? 0}</div>
              <div className="text-bg-500 text-sm">
                {formatTime(stats?.totalFocusTimeMonth ?? 0)}
              </div>
            </div>
          </Widget>
        </div>

        {/* Recent Sessions */}
        <Widget
          className="component-bg-lighter"
          icon="tabler:history"
          title={t('stats.recentSessions')}
        >
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map(session => (
                <div
                  key={session.id}
                  className="border-bg-200 dark:border-bg-700 flex items-center justify-between border-b py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-lg p-3"
                      style={{
                        color: SESSION_STYLES[session.session_type].color,
                        backgroundColor:
                          SESSION_STYLES[session.session_type].color + '20'
                      }}
                    >
                      <Icon
                        className="size-6"
                        icon={SESSION_STYLES[session.session_type].icon}
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {t(`timer.${session.session_type}`)}
                      </div>
                      <div className="text-bg-500 text-sm">
                        {dayjs(session.created).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-end gap-2 text-lg">
                      {dayjs
                        .duration(session.duration_completed, 's')
                        .format('mm:ss')}
                      <p className="text-bg-500 mb-1 block text-sm">
                        /{' '}
                        {dayjs
                          .duration(session.total_duration, 's')
                          .format('mm:ss')}
                      </p>
                    </div>
                    {session.is_completed ? (
                      <Icon
                        className="size-5 text-green-500"
                        icon="tabler:circle-check"
                      />
                    ) : (
                      <Icon
                        className="text-bg-400 size-5"
                        icon="tabler:circle-x"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-bg-500 py-8 text-center">
              {t('stats.noSessions')}
            </div>
          )}
        </Widget>
      </div>
    </div>
  )
}

export default StatisticsModal
