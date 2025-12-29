import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import { WithQuery } from 'lifeforge-ui'
import { createContext, useContext } from 'react'
import type { InferOutput } from 'shared'

export type PomodoroSettings = InferOutput<
  typeof forgeAPI.pomodoroTimer.settings.get
>

const PomodoroSettingsContext = createContext<PomodoroSettings | null>(null)

function PomodoroSettingsProvider({ children }: { children: React.ReactNode }) {
  const settingsQuery = useQuery(
    forgeAPI.pomodoroTimer.settings.get.queryOptions()
  )

  return (
    <WithQuery query={settingsQuery}>
      {settings => (
        <PomodoroSettingsContext.Provider value={settings}>
          {children}
        </PomodoroSettingsContext.Provider>
      )}
    </WithQuery>
  )
}

export default PomodoroSettingsProvider

export function usePomodoroSettings() {
  const context = useContext(PomodoroSettingsContext)

  if (!context) {
    throw new Error(
      'usePomodoroSettings must be used within a PomodoroSettingsProvider'
    )
  }

  return context
}
