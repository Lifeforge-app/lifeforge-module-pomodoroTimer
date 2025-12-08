import type { Session } from '@'
import { Icon } from '@iconify/react'
import { GoBackButton } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'shared'

import StatsCard from './StatsCard'

function SessionEndedScreen({ session }: { session: Session }) {
  const { t } = useTranslation('apps.pomodoroTimer')

  const navigate = useNavigate()

  return (
    <>
      <GoBackButton onClick={() => navigate('/pomodoro-timer')} />
      <div className="flex-center flex-1 flex-col">
        <div className="flex-center flex w-full max-w-xl flex-col px-4 text-center">
          <Icon className="text-bg-500 size-24" icon="tabler:clock-check" />
          <h2 className="mt-12 mb-4 text-3xl font-medium">
            {t('timer.sessionCompleted')}
          </h2>
          <p className="text-bg-500 mb-6">
            {t('timer.sessionCompletedDesc', { name: session.name })}
          </p>
          <StatsCard session={session} />
        </div>
      </div>
    </>
  )
}

export default SessionEndedScreen
