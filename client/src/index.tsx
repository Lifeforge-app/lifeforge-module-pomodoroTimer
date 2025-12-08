import { useActiveSession } from '@/providers/ActiveSessionProvider'
import forgeAPI from '@/utils/forgeAPI'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { type InferOutput } from 'shared'

import Timer from './pages/Timer'
import SessionList from './pages/SessionList'

dayjs.extend(duration)

export type Session = InferOutput<
  typeof forgeAPI.pomodoroTimer.sessions.list
>[number]

export default function PomodoroTimer() {
  const { activeSessionId } = useActiveSession()

  if (activeSessionId) {
    return <Timer />
  }

  return <SessionList />
}
