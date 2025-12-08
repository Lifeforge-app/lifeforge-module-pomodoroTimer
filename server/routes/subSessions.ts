import { z } from 'zod'

import { forgeController, forgeRouter } from '@functions/routes'

const create = forgeController
  .mutation()
  .description({
    en: 'Record a pomodoro sub session',
    ms: 'Rekod sesi pomodoro sub',
    'zh-CN': '记录番茄钟子会话',
    'zh-TW': '記錄番茄鐘子會話'
  })
  .input({
    body: z.object({
      sessionId: z.string(),
      type: z.enum(['work', 'short_break', 'long_break'])
    })
  })
  .existenceCheck('body', {
    sessionId: 'pomodoro_timer__sessions'
  })
  .callback(async ({ body, pb }) => {
    return await pb.create
      .collection('pomodoro_timer__sub_sessions')
      .data({
        session: body.sessionId,
        type: body.type,
        is_completed: false,
        duration_elapsed: 0
      })
      .execute()
  })

const getCurrent = forgeController
  .query()
  .description({
    en: 'Get current unfinished session',
    ms: 'Dapatkan sesi yang belum selesai',
    'zh-CN': '获取当前未完成会话',
    'zh-TW': '獲取當前未完成會話'
  })
  .input({
    query: z.object({
      sessionId: z.string()
    })
  })
  .existenceCheck('query', {
    sessionId: 'pomodoro_timer__sessions'
  })
  .callback(async ({ pb, query }) => {
    const subSession = await pb.getFirstListItem
      .collection('pomodoro_timer__sub_sessions')
      .filter([
        { field: 'is_completed', operator: '=', value: false },
        { field: 'session', operator: '=', value: query.sessionId }
      ])
      .sort(['-created'])
      .execute()
      .catch(() => null)

    return subSession
  })

const update = forgeController
  .mutation()
  .description({
    en: 'Update pomodoro sub session',
    ms: 'Kemas kini sesi pomodoro sub',
    'zh-CN': '更新番茄钟子会话',
    'zh-TW': '更新番茄鐘子會話'
  })
  .input({
    body: z.object({
      id: z.string(),
      duration_elapsed: z.number().optional(),
      is_completed: z.boolean().optional()
    })
  })
  .existenceCheck('body', {
    id: 'pomodoro_timer__sub_sessions'
  })
  .callback(async ({ body, pb }) => {
    return await pb.update
      .collection('pomodoro_timer__sub_sessions')
      .id(body.id)
      .data({
        duration_elapsed: body.duration_elapsed,
        is_completed: body.is_completed
      })
      .execute()
  })

const completeAndStartNew = forgeController
  .mutation()
  .description({
    en: 'Complete current sub session and start a new one',
    ms: 'Selesaikan sesi sub semasa dan mulakan yang baru',
    'zh-CN': '完成当前子会话并开始新的会话',
    'zh-TW': '完成當前子會話並開始新的會話'
  })
  .input({
    body: z.object({
      durationElapsed: z.number(),
      endedTimestamp: z.string(),
      nextSessionType: z.enum(['work', 'short_break', 'long_break']),
      sessionId: z.string()
    })
  })
  .existenceCheck('body', {
    sessionId: 'pomodoro_timer__sessions'
  })
  .callback(async ({ body, pb }) => {
    const lastSubSession = await pb.getFirstListItem
      .collection('pomodoro_timer__sub_sessions')
      .filter([
        { field: 'session', operator: '=', value: body.sessionId },
        { field: 'is_completed', operator: '=', value: false }
      ])
      .sort(['-created'])
      .execute()

    if (!lastSubSession) {
      throw new Error('No sub-session found for the given session ID')
    }

    // Complete current sub-session
    await pb.update
      .collection('pomodoro_timer__sub_sessions')
      .id(lastSubSession.id)
      .data({
        duration_elapsed: body.durationElapsed,
        is_completed: true
      })
      .execute()

    // Start new sub-session
    return await pb.create
      .collection('pomodoro_timer__sub_sessions')
      .data({
        session: body.sessionId,
        type: body.nextSessionType,
        is_completed: false,
        duration_elapsed: 0,
        ended: body.endedTimestamp
      })
      .execute()
  })

const list = forgeController
  .query()
  .description({
    en: 'List pomodoro sessions',
    ms: 'Senarai sesi pomodoro',
    'zh-CN': '列出番茄钟会话',
    'zh-TW': '列出番茄鐘會話'
  })
  .input({
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional()
    })
  })
  .callback(async ({ query, pb }) => {
    let pbQuery = pb.getFullList
      .collection('pomodoro_timer__sub_sessions')
      .sort(['-created'])

    // Add date filtering if provided
    if (query?.startDate && query?.endDate) {
      pbQuery = pbQuery.filter([
        { field: 'created', operator: '>=', value: query.startDate },
        { field: 'created', operator: '<=', value: query.endDate }
      ])
    }

    return await pbQuery.execute()
  })

export default forgeRouter({
  create,
  getCurrent,
  update,
  list,
  completeAndStartNew
})
