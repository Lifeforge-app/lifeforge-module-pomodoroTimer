import { forgeRouter } from '@functions/routes'

import sessions from './routes/sessions'
import settings from './routes/settings'
import subSessions from './routes/subSessions'

export default forgeRouter({
  subSessions,
  settings,
  sessions
})
