import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { useForgeMutation } from '@lifeforge/api'
import {
  CheckboxField,
  ColorField,
  FileField,
  FormModal,
  convertFormFileFieldData,
  createDefaultValues,
  fileValueSchema,
  getFormFileFieldInitialData
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import { type PomodoroSettings } from '@/providers/PomodoroSettingsProvider'

const schema = z.object({
  work_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  short_break_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  long_break_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  auto_start_break: z.boolean(),
  auto_start_work: z.boolean(),
  notification_sound: fileValueSchema
})

export default function SettingsModal({
  onClose,
  data: { initialData }
}: {
  onClose: () => void
  data: {
    initialData: PomodoroSettings
  }
}) {
  const updateMutation = useForgeMutation(forgeAPI.settings.update, {
    action: 'update',
    queryKey: forgeAPI.settings.get.key,
    onSuccess: () => onClose()
  })

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      ...initialData,
      notification_sound: getFormFileFieldInitialData(
        forgeAPI,
        initialData,
        initialData.notification_sound
      )
    },
    resolver: zodResolver(schema)
  })

  return (
    <FormModal
      form={form}
      submissionConfig={{
        template: 'update',
        handler: async formData => {
          await updateMutation.mutateAsync({
            ...formData,
            notification_sound: convertFormFileFieldData(
              formData.notification_sound
            )
          })
        }
      }}
      uiConfig={{
        icon: 'tabler:settings',
        namespace: 'apps.pomodoro-timer',
        title: 'Settings',
        onClose
      }}
    >
      <ColorField
        control={form.control}
        icon="tabler:flame"
        label="workColor"
        name="work_color"
      />
      <ColorField
        control={form.control}
        icon="tabler:coffee"
        label="shortBreakColor"
        name="short_break_color"
      />
      <ColorField
        control={form.control}
        icon="tabler:beach"
        label="longBreakColor"
        name="long_break_color"
      />
      <CheckboxField
        control={form.control}
        icon="tabler:player-stop"
        label="autoStartBreaks"
        name="auto_start_break"
      />
      <CheckboxField
        control={form.control}
        icon="tabler:player-skip-forward"
        label="autoStartWork"
        name="auto_start_work"
      />
      <FileField
        control={form.control}
        icon="tabler:bell"
        label="notificationSound"
        mimeTypes={{ audio: ['mpeg', 'mp3', 'wav', 'ogg', 'webm'] }}
        name="notification_sound"
      />
    </FormModal>
  )
}
