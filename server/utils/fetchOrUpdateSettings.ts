import { SCHEMAS } from '@schema'
import fs from 'fs'
import z from 'zod'

import { PBService } from '@functions/database'

const DEFAULT_SOUND_LOCATION = '../apps/pomodoroTimer/server/assets/bell.opus'

const DEFAULT_SETTINGS: Omit<
  z.infer<typeof SCHEMAS.pomodoro_timer.settings.schema>,
  'created' | 'updated' | 'notification_sound'
> & {
  notification_sound: File
} = {
  work_color: '#fb2c36',
  short_break_color: '#9ae600',
  long_break_color: '#00d3f2',
  auto_start_break: false,
  auto_start_work: false,
  notification_sound: new File(
    [fs.readFileSync(DEFAULT_SOUND_LOCATION)],
    'bell.opus'
  )
}

export default async function fetchOrUpdateSettings({
  pb,
  overwrite
}: {
  pb: PBService
  overwrite?: Partial<
    Omit<
      z.infer<typeof SCHEMAS.pomodoro_timer.settings.schema>,
      'notification_sound'
    >
  > & {
    notification_sound?: File | null | undefined
  }
}) {
  const settings = await pb.getFirstListItem
    .collection('pomodoro_timer__settings')
    .execute()
    .catch(() => null)

  if (!settings) {
    return pb.create
      .collection('pomodoro_timer__settings')
      .data({
        ...DEFAULT_SETTINGS,
        ...(overwrite || {})
      })
      .execute()
  }

  if (JSON.stringify(overwrite || {}) === '{}') {
    return settings
  }

  return pb.update
    .collection('pomodoro_timer__settings')
    .id(settings.id)
    .data({
      ...(overwrite || {})
    })
    .execute()
}
