import { usePomodoro } from '@/providers/PomodoroProvider'
import { Button } from 'lifeforge-ui'

function ControlButtons() {
  const timer = usePomodoro()

  return (
    <div className="mt-6 flex items-center gap-3">
      {!timer.isRunning ? (
        <Button
          icon="tabler:player-play"
          namespace="apps.pomodoroTimer"
          variant="primary"
          onClick={timer.start}
        >
          start
        </Button>
      ) : (
        <Button
          icon="tabler:player-pause"
          namespace="apps.pomodoroTimer"
          variant="primary"
          onClick={timer.pause}
        >
          pause
        </Button>
      )}
      <Button
        disabled={timer.isRunning}
        icon="tabler:refresh"
        namespace="apps.pomodoroTimer"
        variant="secondary"
        onClick={timer.reset}
      >
        reset
      </Button>
      {timer.subSessionType !== 'work' && (
        <Button
          disabled={timer.isRunning}
          icon="tabler:player-skip-forward"
          namespace="apps.pomodoroTimer"
          variant="secondary"
          onClick={timer.skip}
        >
          skip
        </Button>
      )}
    </div>
  )
}

export default ControlButtons
