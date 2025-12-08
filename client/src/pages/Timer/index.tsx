import { useActiveSession } from '@/providers/ActiveSessionProvider'
import { useCurrentSession } from '@/providers/CurrentSessionProvider'

import NewSessionScreen from '../NewSessionScreen'
import SessionEndedScreen from '../SessionEndedScreen'
import ControlButtons from './components/ControlButtons'
import Header from './components/Header'
import ProgressBars from './components/ProgressBars'
import ProgressCircle from './components/ProgressCircle'
import StatusSection from './components/StatusSection'

export default function Timer() {
  const currentSession = useCurrentSession()

  const { setActiveSession } = useActiveSession()

  if (!currentSession) {
    return <></>
  }

  if (currentSession.session.status === 'new') {
    return (
      <NewSessionScreen
        changeStatus={currentSession.changeStatus}
        session={currentSession.session}
      />
    )
  }

  if (currentSession.session.status === 'completed') {
    return <SessionEndedScreen onClose={() => setActiveSession(null)} />
  }

  return (
    <>
      <Header />
      <div className="flex-center flex-1 flex-col gap-6 p-8">
        <StatusSection />
        <ProgressCircle />
        <ProgressBars />
        <ControlButtons />
      </div>
    </>
  )
}
