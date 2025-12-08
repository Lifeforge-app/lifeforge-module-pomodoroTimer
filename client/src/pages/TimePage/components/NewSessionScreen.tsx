import type { Session } from '@'
import { Icon } from '@iconify/react'
import type { UseMutationResult } from '@tanstack/react-query'
import { Button, GoBackButton } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'shared'

function NewSessionScreen({
  session,
  changeStatusMutation
}: {
  session: Session
  changeStatusMutation: UseMutationResult<
    Session,
    unknown,
    { status: Session['status'] },
    unknown
  >
}) {
  const { t } = useTranslation('apps.pomodoroTimer')

  const navigate = useNavigate()

  return (
    <>
      <GoBackButton onClick={() => navigate(-1)} />
      <div className="flex-center flex-1 flex-col">
        <Icon className="text-bg-500 size-24" icon="tabler:clock-bolt" />
        <h2 className="mt-12 mb-4 text-3xl font-medium">
          {session.name || 'New Session'}
        </h2>
        <p className="text-bg-500 mb-6">{t('timer.readyPrompt')}</p>
        <Button
          className="mt-6"
          icon="tabler:play"
          namespace="apps.pomodoroTimer"
          onClick={() => {
            changeStatusMutation.mutateAsync({
              status: 'active'
            })
          }}
        >
          Start Pomodoro
        </Button>
      </div>
    </>
  )
}

export default NewSessionScreen
