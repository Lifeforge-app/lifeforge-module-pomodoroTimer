import { type PomodoroSettings } from '@/providers/PomodoroSettingsProvider'
import forgeAPI from '@/utils/forgeAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormModal, defineForm } from 'lifeforge-ui'
import { type InferInput, getFormFileFieldInitialData } from 'shared'

export default function SettingsModal({
  onClose,
  data: { initialData }
}: {
  onClose: () => void
  data: {
    initialData: PomodoroSettings
  }
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation(
    forgeAPI.pomodoroTimer.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: forgeAPI.pomodoroTimer.settings.get.queryOptions().queryKey
        })
        onClose()
      }
    })
  )

  const { formProps } = defineForm<
    InferInput<typeof forgeAPI.pomodoroTimer.settings.update>['body']
  >({
    title: 'Settings',
    namespace: 'apps.pomodoroTimer',
    icon: 'tabler:settings',
    onClose,
    submitButton: 'update'
  })
    .typesMap({
      auto_start_break: 'checkbox',
      auto_start_work: 'checkbox',
      notification_sound: 'file'
    })
    .setupFields({
      auto_start_break: {
        label: 'Auto-start Breaks',
        icon: 'tabler:player-stop'
      },
      auto_start_work: {
        label: 'Auto-start Work',
        icon: 'tabler:player-skip-forward'
      },
      notification_sound: {
        label: 'Notification Sound',
        icon: 'tabler:bell',
        optional: true,
        acceptedMimeTypes: {
          audio: ['mpeg', 'mp3', 'wav', 'ogg', 'webm']
        }
      }
    })
    .initialData({
      ...initialData,
      notification_sound: getFormFileFieldInitialData(
        forgeAPI,
        initialData,
        initialData.notification_sound
      )
    })
    .onSubmit(async data => {
      await mutation.mutateAsync(data)
    })
    .build()

  return <FormModal {...formProps} />
}
