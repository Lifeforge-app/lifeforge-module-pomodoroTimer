import { forgeRouter } from '@functions/routes'

import sessions from './routes/sessions'
import settings from './routes/settings'

export default forgeRouter({
  settings,
  sessions
})
