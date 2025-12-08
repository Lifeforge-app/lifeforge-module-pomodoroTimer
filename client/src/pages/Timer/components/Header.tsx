import SettingsModal from '@/modal/ModifySettingsModal'
import { useCurrentSession } from '@/providers/CurrentSessionProvider'
import { usePomodoro } from '@/providers/PomodoroProvider'
import { usePomodoroSettings } from '@/providers/PomodoroSettingsProvider'
import {
  Button,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  useModalStore
} from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'

function Header() {
  const { t } = useTranslation('apps.pomodoroTimer')

  const open = useModalStore(state => state.open)

  const timer = usePomodoro()

  const currentSession = useCurrentSession()

  const settings = usePomodoroSettings()

  function handleStopSession() {
    if (!currentSession) return

    open(ConfirmationModal, {
      title: t('modals.endSession.title'),
      description: t('modals.endSession.description', {
        sessionName: currentSession.session.name
      }),
      onConfirm: async () => {
        await timer.endSession()
      }
    })
  }

  if (!currentSession) {
    return null
  }

  return (
    <header className="flex-between mt-2">
      <div>
        <h1 className="text-2xl font-medium">{currentSession.session.name}</h1>
        <p className="text-bg-500 text-sm">
          {t('timer.sessionConfig', {
            durations: `${currentSession.session.work_duration} / ${currentSession.session.short_break_duration} / ${currentSession.session.long_break_duration}`,
            perCycle: currentSession.session.session_until_long_break
          })}
        </p>
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
        <ContextMenu>
          <ContextMenuItem
            icon="tabler:settings"
            label="Settings"
            namespace="apps.pomodoroTimer"
            onClick={() =>
              open(SettingsModal, {
                initialData: settings
              })
            }
          />
        </ContextMenu>
      </div>
    </header>
  )
}

export default Header
