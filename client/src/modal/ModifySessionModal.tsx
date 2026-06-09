import type { Session } from '@'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import type { InferInput } from '@lifeforge/api'
import { FormModal, defineForm, toast } from '@lifeforge/ui'

import DEFAULT_OPTIONS from '@/constants/default_durations'
import { forgeAPI } from '@/manifest'

function ModifySessionModal({
  onClose,
  data: { openType, initialData }
}: {
  onClose: () => void
  data: {
    openType: 'create' | 'update'
    initialData?: Session
  }
}) {
  const qc = useQueryClient()

  const mutation = useMutation(
    (openType === 'create'
      ? forgeAPI.sessions.create
      : forgeAPI.sessions.update.input({
          id: initialData?.id || ''
        })
    ).mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: forgeAPI.sessions.list.key
        })
      },
      onError: error => {
        console.error('Error submitting form:', error)
        toast.error('An error occurred while submitting the form.')
      }
    })
  )

  const { formProps } = defineForm<
    InferInput<(typeof forgeAPI.sessions)[typeof openType]>['body']
  >({
    icon: openType === 'create' ? 'tabler:plus' : 'tabler:pencil',
    title: `session.${openType}`,
    submitButton: openType,
    onClose,
    namespace: 'apps.pomodoro-timer'
  })
    .typesMap({
      name: 'text',
      work_duration: 'slider',
      short_break_duration: 'slider',
      long_break_duration: 'slider',
      session_until_long_break: 'slider'
    })
    .setupFields({
      name: {
        label: 'Session Name',
        icon: 'tabler:tag',
        placeholder: 'My Productive Session',
        required: true
      },
      work_duration: {
        icon: 'tabler:flame',
        label: 'Work Duration',
        required: true,
        min: 1,
        max: 120,
        placeholder: '25',
        hidden: openType === 'update'
      },
      short_break_duration: {
        icon: 'tabler:coffee',
        label: 'Short Break Duration',
        required: true,
        min: 1,
        max: 60,
        placeholder: '5',
        hidden: openType === 'update'
      },
      long_break_duration: {
        icon: 'tabler:beach',
        label: 'Long Break Duration',
        required: true,
        min: 1,
        max: 120,
        placeholder: '15',
        hidden: openType === 'update'
      },
      session_until_long_break: {
        icon: 'tabler:rotate-clockwise-2',
        label: 'Sessions Until Long Break',
        required: true,
        min: 1,
        max: 10,
        placeholder: '4',
        hidden: openType === 'update'
      }
    })
    .autoFocusField('name')
    .initialData(
      initialData || {
        name: `Productive Session on ${dayjs().format('MMM D')}`,
        work_duration: DEFAULT_OPTIONS.work,
        short_break_duration: DEFAULT_OPTIONS.short_break,
        long_break_duration: DEFAULT_OPTIONS.long_break,
        session_until_long_break: DEFAULT_OPTIONS.session_until_long_break
      }
    )
    .onSubmit(async values => {
      await mutation.mutateAsync(values)
    })
    .build()

  return <FormModal {...formProps} />
}

export default ModifySessionModal
