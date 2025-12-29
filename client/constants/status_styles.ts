import type { Session } from '@'
import COLORS from 'tailwindcss/colors'

const STATUS_STYLES: Record<
  Session['status'],
  { icon: string; color: string }
> = {
  new: {
    icon: 'tabler:progress',
    color: COLORS.sky[500]
  },
  active: {
    icon: 'tabler:progress-bolt',
    color: COLORS.orange[500]
  },
  completed: {
    icon: 'tabler:progress-check',
    color: COLORS.green[500]
  }
}

export default STATUS_STYLES
