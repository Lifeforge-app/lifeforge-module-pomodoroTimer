import { lazy } from 'react'
import type { ModuleConfig } from 'shared'

export default {
  name: 'Pomodoro Timer',
  icon: 'tabler:clock-bolt',
  routes: {
    '/': lazy(() => import('@'))
  },
  category: 'Productivity',
  clearQueryOnUnmount: false
} satisfies ModuleConfig
