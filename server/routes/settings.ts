import { z } from 'zod'

import getMedia from '@functions/external/media'
import { forgeController, forgeRouter } from '@functions/routes'

import fetchOrUpdateSettings from '../utils/fetchOrUpdateSettings'

const get = forgeController
  .query()
  .description({
    en: 'Get user pomodoro settings',
    ms: 'Dapatkan tetapan pomodoro pengguna',
    'zh-CN': '获取用户番茄钟设置',
    'zh-TW': '獲取用戶番茄鐘設定'
  })
  .input({})
  .callback(({ pb }) => fetchOrUpdateSettings({ pb }))

const update = forgeController
  .mutation()
  .description({
    en: 'Update pomodoro settings',
    ms: 'Kemas kini tetapan pomodoro',
    'zh-CN': '更新番茄钟设置',
    'zh-TW': '更新番茄鐘設定'
  })
  .input({
    body: z.object({
      auto_start_break: z.boolean().optional(),
      auto_start_work: z.boolean().optional(),
      work_color: z.string().optional(),
      short_break_color: z.string().optional(),
      long_break_color: z.string().optional()
    })
  })
  .media({
    notification_sound: {
      optional: true
    }
  })
  .callback(async ({ body, pb, media: { notification_sound } }) =>
    fetchOrUpdateSettings({
      pb,
      overwrite: {
        ...body,
        ...(await getMedia('notification_sound', notification_sound))
      }
    })
  )

export default forgeRouter({ get, update })
