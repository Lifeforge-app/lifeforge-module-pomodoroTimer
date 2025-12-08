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
      // For batch completion - array of subsession data
      subSessions: z
        .array(
          z.object({
            type: z.enum(['work', 'short_break', 'long_break']),
            duration_elapsed: z.number(),
            ended: z.string(),
            is_completed: z.boolean()
          })
        )
        .optional(),
      pomodoroCount: z.number().optional()
    })
  })
  .existenceCheck('query', {
    id: 'pomodoro_timer__sessions'
  })
  .callback(
    async ({
      query: { id },
      body: { status, subSessions, pomodoroCount },
      pb
    }) => {
      // If completing with subsession data, create all subsessions
      if (status === 'completed' && subSessions && subSessions.length > 0) {
        // Create all subsession records
        for (const subSession of subSessions) {
          await pb.create
            .collection('pomodoro_timer__sub_sessions')
            .data({
              session: id,
              type: subSession.type,
              duration_elapsed: subSession.duration_elapsed,
              ended: subSession.ended,
              is_completed: subSession.is_completed
            })
            .execute()
        }

        // Calculate total time elapsed
        const totalTimeElapsed = subSessions.reduce(
          (sum, s) => sum + s.duration_elapsed,
          0
        )

        // Update session with final stats
        await pb.update
          .collection('pomodoro_timer__sessions')
          .id(id)
          .data({
            status,
            total_time_elapsed: totalTimeElapsed,
            pomodoro_count: pomodoroCount ?? 0
          })
          .execute()
      } else {
        // Simple status change
        await pb.update
          .collection('pomodoro_timer__sessions')
          .id(id)
          .data({
            status
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

const listSubSessions = forgeController
  .query()
  .description({
    en: 'List sub-sessions for a pomodoro session',
    ms: 'Senarai sub-sesi untuk sesi pomodoro',
    'zh-CN': '列出番茄钟会话的子会话',
    'zh-TW': '列出番茄鐘會話的子會話'
  })
  .input({
    query: z.object({
      sessionId: z.string()
    })
  })
  .existenceCheck('query', {
    sessionId: 'pomodoro_timer__sessions'
  })
  .callback(async ({ query: { sessionId }, pb }) => {
    return await pb.getFullList
      .collection('pomodoro_timer__sub_sessions')
      .filter([{ field: 'session', operator: '=', value: sessionId }])
      .sort(['created'])
      .execute()
  })

export default forgeRouter({
  getById,
  list,
  create,
  update,
  changeStatus,
  remove,
  listSubSessions
})
