import { lazy } from 'react'

import { createForgeModuleClient } from '@lifeforge/federation'

import contract from './contract'

const { forgeAPI, ...manifest } = createForgeModuleClient({
  provider: lazy(() => import('@/providers/PomodoroProviders')),
  routes: {
    '/': lazy(() => import('@'))
  },
  contract
})

export default manifest

export { forgeAPI }
