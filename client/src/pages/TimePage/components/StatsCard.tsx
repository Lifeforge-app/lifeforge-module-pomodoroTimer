import type { Session } from '@'
import { Icon } from '@iconify/react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

function StatsCard({ session }: { session: Session }) {
  const { t } = useTranslation('apps.pomodoroTimer')

  return (
    <div className="mt-4 flex w-full min-w-0 flex-wrap items-center gap-4 text-left">
      <div className="bg-bg-100/50 dark:bg-bg-800/50 flex w-full flex-1 items-center gap-3 rounded-xl p-4 pr-5 pl-5">
        <div className="bg-custom-500/20 rounded-lg p-3">
          <Icon className="text-custom-500 size-6" icon="tabler:flame" />
        </div>
        <div>
          <div className="text-2xl font-medium">{session.pomodoro_count}</div>
          <div className="text-bg-500 font-medium">
            {t('timer.pomodoroCompleted')}
          </div>
        </div>
      </div>
      <div className="bg-bg-100/50 dark:bg-bg-800/50 flex w-full flex-1 shrink-0 items-center gap-3 rounded-xl p-4 pr-5 pl-5">
        <div className="rounded-lg bg-green-500/20 p-3">
          <Icon className="size-6 text-green-500" icon="tabler:clock" />
        </div>
        <div>
          <div className="text-2xl font-medium">
            {dayjs
              .duration(session.total_time_elapsed, 'seconds')
              .format('H[ h ]mm[ m]')}
          </div>
          <div className="text-bg-500 font-medium">{t('timer.focusTime')}</div>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
