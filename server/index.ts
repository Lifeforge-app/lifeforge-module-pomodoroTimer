import { forgeRouter } from '@lifeforge/server-utils'

import * as sessionsRoutes from './routes/sessions'
import * as settingsRoutes from './routes/settings'

export default forgeRouter({
  settings: settingsRoutes,
  sessions: sessionsRoutes
})
