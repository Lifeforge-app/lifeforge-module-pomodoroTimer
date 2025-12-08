import type { SubSessionType } from '@/pages/TimePage/providers/PomodoroProvider'
import { anyColorToHex } from 'shared'
import COLORS from 'tailwindcss/colors'

const SESSION_STYLES: Record<SubSessionType, { icon: string; color: string }> =
  {
    work: {
      icon: 'tabler:flame',
      color: anyColorToHex(COLORS.red[500]) || ''
    },
    short_break: {
      icon: 'tabler:coffee',
      color: anyColorToHex(COLORS.green[500]) || ''
    },
    long_break: {
      icon: 'tabler:beach',
      color: anyColorToHex(COLORS.blue[500]) || ''
    }
  }

export default SESSION_STYLES
