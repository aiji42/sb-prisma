import { Args, ModelMapping } from '../types'
import SupabaseResponse from '../response/SupabaseResponse'
import { Fetcher } from './makeFetcher'
import { v4 as uuid } from 'uuid'

export const makeHooks = (fetcher: Fetcher, modelMapping: ModelMapping) => ({
  beforeRequest: async ({
    args = {},
    rootField,
  }: {
    args?: Args
    rootField: string
  }) => {
    const [model, method] = getModelAndMethod(rootField, modelMapping)
    if (['findFirst', 'findUnique'].includes(method))
      await findOne(fetcher)(args, model, modelMapping)
    if (method === 'findMany')
      await findMany(fetcher)(args, model, modelMapping)
    if (method === 'deleteOne')
      await deleteOne(fetcher)(args, model, modelMapping)
    if (method === 'deleteMany')
      await deleteMany(fetcher)(args, model, modelMapping)
    if (method === 'updateOne')
      await updateOne(fetcher)(args, model, modelMapping)
    if (method === 'updateMany')
      await updateMany(fetcher)(args, model, modelMapping)
    if (method === 'createOne')
      await createOne(fetcher)(args, model, modelMapping)
    if (method === 'createMany')
      await createMany(fetcher)(args, model, modelMapping)
  },
})

const findOne =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(args, 'GET', model, modelMapping)
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    throw new SupabaseResponse({ data: singly(await res.json()) })
  }

const findMany =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(args, 'GET', model, modelMapping)
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    throw new SupabaseResponse({ data: await res.json() })
  }

const deleteOne =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(args, 'DELETE', model, modelMapping, {
      Prefer: 'return=representation',
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    if (data.length < 1)
      throw Error(
        'An operation failed because it depends on one or more records that were required but not found. Record to delete does not exist.',
      )
    throw new SupabaseResponse({ data: singly(data) })
  }

const deleteMany =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(args, 'DELETE', model, modelMapping, {
      Prefer: 'return=representation',
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: { count: data.length } })
  }

const updateOne =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(
      { ...args, data: autoUpdatedAt(model, args.data, modelMapping) },
      'PATCH',
      model,
      modelMapping,
      {
        Prefer: 'return=representation',
      },
    )
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: singly(data) })
  }

const updateMany =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(
      { ...args, data: autoUpdatedAt(model, args.data, modelMapping) },
      'PATCH',
      model,
      modelMapping,
      {
        Prefer: 'return=representation',
      },
    )
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: { count: data.length } })
  }

const createOne =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(
      { ...args, data: autoId(model, args.data, modelMapping) },
      'POST',
      model,
      modelMapping,
      {
        Prefer: 'return=representation',
      },
    )
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: singly(data) })
  }

const createMany =
  (fetcher: Fetcher) =>
  async (args: Args, model: string, modelMapping: ModelMapping) => {
    const res = await fetcher(
      { ...args, data: autoId(model, args.data, modelMapping) },
      'POST',
      model,
      modelMapping,
      {
        Prefer: `return=representation${
          args.skipDuplicates ? ',resolution=ignore-duplicates' : ''
        }`,
      },
    )
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: { count: data.length } })
  }

const singly = (
  data: SupabaseResponse['data'][],
): SupabaseResponse['data'] | undefined => {
  return data[0]
}

const getModelAndMethod = (
  rootField: string,
  modelMapping: ModelMapping,
): [string, string] => {
  const { model, method } = modelMapping.operationMapping[rootField] ?? {}
  if (!(model && method))
    throw new Error(
      `@sb-prisma/client Error: The definition of ${rootField} does not exist in modelMapping.operationMapping.`,
    )

  return [model, method]
}

const autoUpdatedAt = (
  model: string,
  data: Args['data'],
  { models }: ModelMapping,
) => {
  if (!data) return data
  const now = new Date()
  const filler = Object.entries(models[model]?.fields ?? {}).reduce<
    Record<string, Date>
  >((res, [col, field]) => {
    if (
      !(
        field.isUpdatedAt &&
        typeof field.default === 'object' &&
        field.default.name === 'now'
      )
    )
      return res
    return { ...res, [col]: now }
  }, {})

  if (Array.isArray(data)) return data.map((d) => ({ ...filler, ...d }))
  return { ...filler, ...data }
}

const autoId = (
  model: string,
  data: Args['data'],
  { models }: ModelMapping,
) => {
  if (!data) return data
  const columns = Object.entries(models[model]?.fields ?? {}).reduce<string[]>(
    (res, [col, field]) => {
      if (typeof field.default !== 'object') return res
      if (field.default.name === 'uuid') return [...res, col]
      if (field.default.name === 'cuid')
        throw new Error(
          '@sb-prisma Error: not supported `@default(cuid())`. Please use `@default(uuid())`',
        )
      return res
    },
    [],
  )
  if (columns.length < 1) return data

  if (Array.isArray(data))
    return data.map((d) => ({
      ...Object.fromEntries(columns.map((col) => [col, uuid()])),
      ...d,
    }))
  return { ...Object.fromEntries(columns.map((col) => [col, uuid()])), ...data }
}
