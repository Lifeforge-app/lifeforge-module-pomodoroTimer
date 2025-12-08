import ModifySessionModal from '@/modal/ModifySessionModal'
import SettingsModal from '@/modal/ModifySettingsModal'
import { usePomodoroSettings } from '@/providers/PomodoroSettingsProvider'
import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  ContextMenuItem,
  EmptyStateScreen,
  ModuleHeader,
  Scrollbar,
  WithQuery,
  useModalStore
} from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'

import SessionCard from './components/SessionCard'

export default function SessionList() {
  const { t } = useTranslation('apps.pomodoroTimer')

  const { open } = useModalStore()

  const settings = usePomodoroSettings()

  const sessionsQuery = useQuery(
    forgeAPI.pomodoroTimer.sessions.list.queryOptions()
  )

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            icon="tabler:plus"
            tProps={{
              item: t('items.session')
            }}
            onClick={() => {
              open(ModifySessionModal, {
                openType: 'create'
              })
            }}
          >
            New
          </Button>
        }
        contextMenuProps={{
          children: (
            <>
              <ContextMenuItem
                icon="tabler:settings"
                label={t('tabs.settings')}
                onClick={() =>
                  open(SettingsModal, {
                    initialData: settings
                  })
                }
              />
            </>
          )
        }}
      />
      <WithQuery query={sessionsQuery}>
        {sessions =>
          sessions.length ? (
            <Scrollbar>
              <div className="space-y-3">
                {sessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </Scrollbar>
          ) : (
            <EmptyStateScreen
              icon="tabler:clock-off"
              message={{
                id: 'session',
                namespace: 'apps.pomodoroTimer'
              }}
            />
          )
        }
      </WithQuery>
    </>
  )
}
