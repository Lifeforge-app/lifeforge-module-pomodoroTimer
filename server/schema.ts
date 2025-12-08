import z from 'zod'

const pomodoroTimerSchemas = {
  settings: {
    schema: z.object({
      auto_start_break: z.boolean(),
      auto_start_work: z.boolean(),
      notification_sound: z.string(),
      work_color: z.string(),
      short_break_color: z.string(),
      long_break_color: z.string(),
      created: z.string(),
      updated: z.string()
    }),
    raw: {
      id: 'pbc_1166104964',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'pomodoro_timer__settings',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'bool3360177899',
          name: 'auto_start_break',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: 'bool107667833',
          name: 'auto_start_work',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          hidden: false,
          id: 'file1043998333',
          maxSelect: 1,
          maxSize: 0,
          mimeTypes: [],
          name: 'notification_sound',
          presentable: false,
          protected: false,
          required: false,
          system: false,
          thumbs: [],
          type: 'file'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text1319973830',
          max: 0,
          min: 0,
          name: 'work_color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3106559776',
          max: 0,
          min: 0,
          name: 'short_break_color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text988500973',
          max: 0,
          min: 0,
          name: 'long_break_color',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate'
        }
      ],
      indexes: [],
      system: false
    }
  },
  sessions: {
    schema: z.object({
      work_duration: z.number(),
      short_break_duration: z.number(),
      long_break_duration: z.number(),
      session_until_long_break: z.number(),
      name: z.string(),
      status: z.enum(['new', 'active', 'completed']),
      created: z.string(),
      total_time_elapsed: z.number(),
      pomodoro_count: z.number()
    }),
    raw: {
      id: 'pbc_540231054',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'pomodoro_timer__sessions',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number1407847068',
          max: null,
          min: null,
          name: 'work_duration',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2361925209',
          max: null,
          min: null,
          name: 'short_break_duration',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2645568747',
          max: null,
          min: null,
          name: 'long_break_duration',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2396343358',
          max: null,
          min: null,
          name: 'session_until_long_break',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text2555543084',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: 'select2063623452',
          maxSelect: 1,
          name: 'status',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['new', 'active', 'completed']
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'number3086316498',
          max: null,
          min: null,
          name: 'total_time_elapsed',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number301499186',
          max: null,
          min: null,
          name: 'pomodoro_count',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false
    }
  },
  sub_sessions: {
    schema: z.object({
      type: z.enum(['work', 'short_break', 'long_break']),
      duration_elapsed: z.number(),
      is_completed: z.boolean(),
      session: z.string(),
      ended: z.string(),
      created: z.string()
    }),
    raw: {
      id: 'pbc_983852114',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'pomodoro_timer__sub_sessions',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'select1253005059',
          maxSelect: 1,
          name: 'type',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['work', 'short_break', 'long_break']
        },
        {
          hidden: false,
          id: 'number2254405824',
          max: null,
          min: null,
          name: 'duration_elapsed',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'bool1023422721',
          name: 'is_completed',
          presentable: false,
          required: false,
          system: false,
          type: 'bool'
        },
        {
          cascadeDelete: true,
          collectionId: 'pbc_540231054',
          hidden: false,
          id: 'relation3494172116',
          maxSelect: 1,
          minSelect: 0,
          name: 'session',
          presentable: false,
          required: false,
          system: false,
          type: 'relation'
        },
        {
          hidden: false,
          id: 'date1367529039',
          max: '',
          min: '',
          name: 'ended',
          presentable: false,
          required: false,
          system: false,
          type: 'date'
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        }
      ],
      indexes: [],
      system: false
    }
  },
  sessions_aggregated: {
    schema: z.object({
      work_duration: z.number(),
      short_break_duration: z.number(),
      long_break_duration: z.number(),
      session_until_long_break: z.number(),
      name: z.string(),
      status: z.enum(['new', 'active', 'completed']),
      created: z.string(),
      pomodoro_count: z.number(),
      total_time_elapsed: z.any()
    }),
    raw: {
      id: 'pbc_538305253',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: 'pomodoro_timer__sessions_aggregated',
      type: 'view',
      fields: [
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text3208210256',
          max: 0,
          min: 0,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: '_clone_ROel',
          max: null,
          min: null,
          name: 'work_duration',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '_clone_xsox',
          max: null,
          min: null,
          name: 'short_break_duration',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '_clone_d3Bp',
          max: null,
          min: null,
          name: 'long_break_duration',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: '_clone_yvbh',
          max: null,
          min: null,
          name: 'session_until_long_break',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: '_clone_MyeG',
          max: 0,
          min: 0,
          name: 'name',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text'
        },
        {
          hidden: false,
          id: '_clone_mlZj',
          maxSelect: 1,
          name: 'status',
          presentable: false,
          required: true,
          system: false,
          type: 'select',
          values: ['new', 'active', 'completed']
        },
        {
          hidden: false,
          id: '_clone_i9kj',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'number301499186',
          max: null,
          min: null,
          name: 'pomodoro_count',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'json3086316498',
          maxSize: 1,
          name: 'total_time_elapsed',
          presentable: false,
          required: false,
          system: false,
          type: 'json'
        }
      ],
      indexes: [],
      system: false,
      viewQuery:
        "SELECT \n  s.id,\n  s.work_duration,\n  s.short_break_duration,\n  s.long_break_duration,\n  s.session_until_long_break,\n  s.name,\n  s.status,\n  s.created,\n  COUNT(wss.id) AS pomodoro_count,\n  SUM(wss.duration_elapsed) as total_time_elapsed\nFROM pomodoro_timer__sessions AS s\nLEFT JOIN pomodoro_timer__sub_sessions AS wss\n  ON s.id = wss.session\n  AND wss.type = 'work'\n  AND wss.is_completed = TRUE\nGROUP BY s.id;"
    }
  }
}

export default pomodoroTimerSchemas
