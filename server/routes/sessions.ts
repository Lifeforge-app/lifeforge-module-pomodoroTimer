import z from 'zod'

import { forgeController, forgeRouter } from '@functions/routes'

const getById = forgeController
  .query()
  .description({
    en: 'Get pomodoro session by ID',
    ms: 'Dapatkan sesi pomodoro mengikut ID',
    'zh-CN': '通过ID获取番茄钟会话',
    'zh-TW': '通過ID獲取番茄鐘會話'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'pomodoro_timer__sessions'
  })
  .callback(async ({ query: { id }, pb }) => {
    const lastSubSession = await pb.getFirstListItem
      .collection('pomodoro_timer__sub_sessions')
      .filter([{ field: 'session', operator: '=', value: id }])
      .sort(['-created'])
      .execute()
      .catch(() => null)

    return {
      lastSubSessionType: lastSubSession?.type || 'short_break',
      ...(await pb.getOne
        .collection('pomodoro_timer__sessions_aggregated')
        .id(id)
        .execute())
    }
  })

const validateId = forgeController
  .query()
  .description({
    en: 'Validate pomodoro session ID',
    ms: 'Sahkan ID sesi pomodoro',
    'zh-CN': '验证番茄钟会话ID',
    'zh-TW': '驗證番茄鐘會話ID'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .callback(({ query: { id }, pb }) =>
    pb.getOne
      .collection('pomodoro_timer__sessions')
      .id(id)
      .execute()
      .then(() => true)
      .catch(() => false)
  )

const list = forgeController
  .query()
  .description({
    en: 'List all pomodoro sessions',
    ms: 'Senarai semua sesi pomodoro',
    'zh-CN': '列出所有番茄钟会话',
    'zh-TW': '列出所有番茄鐘會話'
  })
  .input({})
  .callback(async ({ pb }) => {
    return await pb.getFullList
      .collection('pomodoro_timer__sessions_aggregated')
      .sort(['-created'])
      .execute()
  })

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new pomodoro session',
    ms: 'Buat sesi pomodoro baru',
    'zh-CN': '创建新的番茄钟会话',
    'zh-TW': '創建新的番茄鐘會話'
  })
  .input({
    body: z.object({
      name: z.string(),
      work_duration: z.number().min(1).max(120),
      short_break_duration: z.number().min(1).max(60),
      long_break_duration: z.number().min(1).max(120),
      session_until_long_break: z.number().min(1).max(10)
    })
  })
  .callback(
    async ({
      body: {
        name,
        work_duration,
        short_break_duration,
        long_break_duration,
        session_until_long_break
      },
      pb
    }) => {
      return await pb.create
        .collection('pomodoro_timer__sessions')
        .data({
          name,
          work_duration,
          short_break_duration,
          long_break_duration,
          session_until_long_break,
          status: 'new'
        })
        .execute()
    }
  )

const update = forgeController
  .mutation()
  .description({
    en: 'Update a pomodoro session',
    ms: 'Kemas kini sesi pomodoro',
    'zh-CN': '更新番茄钟会话',
    'zh-TW': '更新番茄鐘會話'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: z.object({
      name: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'pomodoro_timer__sessions'
  })
  .callback(({ query: { id }, body, pb }) =>
    pb.update
      .collection('pomodoro_timer__sessions')
      .id(id)
      .data({
        name: body.name
      })
      .execute()
  )

const changeStatus = forgeController
  .mutation()
  .description({
    en: 'Change status of a pomodoro session',
    ms: 'Tukar status sesi pomodoro',
    'zh-CN': '更改番茄钟会话的状态',
    'zh-TW': '更改番茄鐘會話的狀態'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: z.object({
      status: z.enum(['new', 'active', 'completed']),
      subSessionId: z.string().optional(),
      subSessionEndedTimestamp: z.string().optional(),
      subSessionDurationElapsed: z.number().optional()
    })
  })
  .existenceCheck('query', {
    id: 'pomodoro_timer__sessions'
  })
  .existenceCheck('body', {
    subSessionId: '[pomodoro_timer__sub_sessions]'
  })
  .callback(
    async ({
      query: { id },
      body: {
        status,
        subSessionId,
        subSessionEndedTimestamp,
        subSessionDurationElapsed
      },
      pb
    }) => {
      await pb.update
        .collection('pomodoro_timer__sessions')
        .id(id)
        .data({
          status
        })
        .execute()

      if (subSessionId) {
        await pb.update
          .collection('pomodoro_timer__sub_sessions')
          .id(subSessionId)
          .data({
            is_completed: true,
            duration_elapsed: subSessionDurationElapsed,
            ended: subSessionEndedTimestamp
          })
          .execute()
      }

      return await pb.getOne
        .collection('pomodoro_timer__sessions_aggregated')
        .id(id)
        .execute()
    }
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a pomodoro session',
    ms: 'Padam sesi pomodoro',
    'zh-CN': '删除番茄钟会话',
    'zh-TW': '刪除番茄鐘會話'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'pomodoro_timer__sessions'
  })
  .callback(({ query: { id }, pb }) =>
    pb.delete.collection('pomodoro_timer__sessions').id(id).execute()
  )

export default forgeRouter({
  getById,
  validateId,
  list,
  create,
  update,
  changeStatus,
  remove
})
