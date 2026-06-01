import { lazy } from 'react'

import type { ModuleConfig } from '@lifeforge/shared'

export default {
  provider: lazy(() => import('@/providers/PomodoroProviders')),
  routes: {
    '/': lazy(() => import('@'))
  }
} satisfies ModuleConfig
