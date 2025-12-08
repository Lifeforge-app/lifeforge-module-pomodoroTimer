import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import { WithQuery } from 'lifeforge-ui'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'shared'

function SessionValidityProvider({ children }: { children: React.ReactNode }) {
  const { sessionId } = useParams<{ sessionId: string }>()

  const navigate = useNavigate()

  const isValidSessionIdQuery = useQuery(
    forgeAPI.pomodoroTimer.sessions.validateId
      .input({
        id: sessionId || ''
      })
      .queryOptions({
        enabled: !!sessionId
      })
  )

  useEffect(() => {
    if (
      isValidSessionIdQuery.isFetched &&
      !isValidSessionIdQuery.data &&
      sessionId
    ) {
      toast.error('The specified session does not exist.')
      navigate('/')
    }
  }, [
    isValidSessionIdQuery.isFetched,
    isValidSessionIdQuery.data,
    sessionId,
    navigate
  ])

  return (
    <WithQuery query={isValidSessionIdQuery}>
      {isValid => <>{isValid ? children : <></>}</>}
    </WithQuery>
  )
}

export default SessionValidityProvider
