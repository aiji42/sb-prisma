import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseClinet = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_ANON_KEY ?? '',
)

const prisma = new PrismaClient({
  // @ts-ignore
  __internal: {
    hooks: {
      beforeRequest: async ({
        args = {},
        typeName,
      }: {
        args?: Args
        typeName: string
        document: any
      }) => {
        let supabasePromise = supabaseClinet
          .from(typeName!)
          .select(createSelect(args, typeName ?? ''))

        if (args.take || args.skip)
          supabasePromise = supabasePromise.range(
            args.skip ?? 0,
            args.take ?? 1_000,
          )
        if (args.orderBy) {
          const orderBy = Array.isArray(args.orderBy)
            ? args.orderBy
            : [args.orderBy]
          orderBy.forEach((o) => {
            Object.entries(o).forEach(([k, v]) => {
              supabasePromise = supabasePromise.order(k, {
                ascending: v === 'asc',
              })
            })
          })
        }
        if (args.where) {
          Object.entries(args.where).forEach(([col, op]) => {
            if (['AND', 'OR', 'NOT'].includes(col)) {
              console.warn('Not yet supported by `AND`, `OR` and `NOT`')
              return
            }
            if (op === null || op === true || op === false) {
              supabasePromise = supabasePromise.filter(col, 'is', op)
              return
            }
            if (['string', 'number'].includes(typeof op)) {
              supabasePromise = supabasePromise.filter(col, 'eq', op)
              return
            }
            if (isOperator(op)) {
              if ('not' in op) {
                // TODO
              }
              if ('equals' in op) {
                if (typeof op.equals === 'boolean' || op.equals === null) {
                  supabasePromise = supabasePromise.filter(col, 'is', op.equals)
                } else {
                  supabasePromise = supabasePromise.filter(col, 'eq', op.equals)
                }
              }
              if ('in' in op) {
                supabasePromise = supabasePromise.filter(
                  col,
                  'in',
                  JSON.stringify(op.in).replace(/^\[/, '(').replace(/]$/, ')'),
                )
              }
              if ('notIn' in op) {
                supabasePromise = supabasePromise.filter(
                  col,
                  'not.in',
                  JSON.stringify(op.notIn)
                    .replace(/^\[/, '(')
                    .replace(/]$/, ')'),
                )
              }
              if ('lt' in op) {
                supabasePromise = supabasePromise.filter(col, 'lt', op.lt)
              }
              if ('lte' in op) {
                supabasePromise = supabasePromise.filter(col, 'lte', op.lte)
              }
              if ('gt' in op) {
                supabasePromise = supabasePromise.filter(col, 'gt', op.gt)
              }
              if ('gte' in op) {
                supabasePromise = supabasePromise.filter(col, 'gte', op.gte)
              }
              if ('contains' in op) {
                supabasePromise = supabasePromise.filter(
                  col,
                  op.mode === 'insensitive' ? 'ilike' : 'like',
                  `%${op.contains}%`,
                )
              }
              if ('startsWith' in op) {
                supabasePromise = supabasePromise.filter(
                  col,
                  op.mode === 'insensitive' ? 'ilike' : 'like',
                  `${op.startsWith}%`,
                )
              }
              if ('endsWith' in op) {
                supabasePromise = supabasePromise.filter(
                  col,
                  op.mode === 'insensitive' ? 'ilike' : 'like',
                  `%${op.startsWith}`,
                )
              }
            }
          })
        }

        const { data, error } = await supabasePromise
        console.log('------supabase-------')
        console.dir(data, { depth: 5 })
        error && console.error(error)
        console.log('---------------------')
      },
    },
  },
})

const modelMapper: Record<string, string> = {
  'User.Team': 'Team',
  'Team.users': 'User',
}

const operatorMapping = {
  equals: 'eq',
  not: 'neq',
  in: 'in',
  notIn: 'not.in',
  lt: 'lt',
  lte: 'lte',
  gt: 'gt',
  gte: 'gte',
  contains: true,
  mode: true,
  startsWith: 'like',
  endsWith: 'like',
}

type Scalar = number | string | boolean | null

type Operators = {
  equals?: Scalar
  in?: Scalar[]
  notIn?: Scalar[]
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  contains?: string
  mode?: 'default' | 'insensitive'
  startsWith?: string
  endsWith?: string
}

type NegativeOperators = {
  not?: Omit<Operators, 'mode'> | Scalar
}

type Where = {
  [field: string]: (Operators & NegativeOperators) | Scalar
}

const isOperator = (
  op: Where | (Operators & NegativeOperators) | Scalar | Where[],
): op is Operators & NegativeOperators => {
  return typeof op === 'object' && !Array.isArray(op)
}

type Args = {
  select?: Select
  take?: number
  skip?: number
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]
  where?: Where & {
    AND?: Where[] | Where
    OR?: Where[] | Where
    NOT?: Where[] | Where
  }
}

type Select = Record<string, boolean | Args>

const createSelect = (args: Args, rootField: string): string => {
  if (!args.select) return '*'
  return Object.entries(args.select)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const model = modelMapper[`${rootField}.${k}`]
      if (!model) return k
      const alias = `${k}:${model}`
      return `${alias}(${createSelect(
        typeof v === 'object' ? v : {},
        model || k,
      )})`
    })
    .join(',')
}

const main = async () => {
  console.dir(
    await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        Team: {
          select: {
            users: true,
          },
        },
      },
      take: 3,
      skip: 0,
      orderBy: { id: 'desc' },
      where: {
        id: { notIn: [2] },
      },
    }),
    { depth: 5 },
  )

  console.dir(
    await prisma.team.findMany({
      select: {
        id: true,
        name: false,
        users: {
          select: {
            Team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      where: {
        name: { in: ['team1', 'team2'] },
        id: { gte: 1 },
      },
    }),
    { depth: 5 },
  )
}

main().catch(console.log)
