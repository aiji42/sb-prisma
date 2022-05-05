import { Args } from './types'
import SupabaseResponse from '../response/SupabaseResponse'
import { Fetcher } from './makeFetcher'

export const makeHooks = (
  fetcher: Fetcher,
  modelMapper: Record<string, string>,
) => ({
  beforeRequest: async ({
    args = {},
    clientMethod,
  }: {
    args?: Args
    clientMethod: string
  }) => {
    const [table, method] = getTableAndMethod(clientMethod, modelMapper)
    if (['findFirst', 'findUnique'].includes(method))
      await findOne(fetcher)(args, table, modelMapper)
    if (method === 'findMany') await findMany(fetcher)(args, table, modelMapper)
    if (method === 'delete') await deleteOne(fetcher)(args, table, modelMapper)
    if (method === 'deleteMany')
      await deleteMany(fetcher)(args, table, modelMapper)
    if (method === 'update') await updateOne(fetcher)(args, table, modelMapper)
    if (method === 'updateMany')
      await updateMany(fetcher)(args, table, modelMapper)
    if (method === 'create') await createOne(fetcher)(args, table, modelMapper)
    if (method === 'createMany')
      await createMany(fetcher)(args, table, modelMapper)
  },
})

const findOne =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'GET', table, modelMapper)
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    throw new SupabaseResponse({ data: singly(await res.json()) })
  }

const findMany =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'GET', table, modelMapper)
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    throw new SupabaseResponse({ data: await res.json() })
  }

const deleteOne =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'DELETE', table, modelMapper, {
      Prefer: 'return=representation',
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    // TODO
    if (data.length < 1) throw Error('')
    throw new SupabaseResponse({ data: singly(data) })
  }

const deleteMany =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'DELETE', table, modelMapper, {
      Prefer: 'return=representation',
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: { count: data.length } })
  }

const updateOne =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'PATCH', table, modelMapper, {
      Prefer: 'return=representation',
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: singly(data) })
  }

const updateMany =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'PATCH', table, modelMapper, {
      Prefer: 'return=representation',
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: { count: data.length } })
  }

const createOne =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'POST', table, modelMapper, {
      Prefer: 'return=representation',
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: singly(data) })
  }

const createMany =
  (fetcher: Fetcher) =>
  async (args: Args, table: string, modelMapper: Record<string, string>) => {
    const res = await fetcher(args, 'POST', table, modelMapper, {
      Prefer: `return=representation${
        args.skipDuplicates ? ',resolution=ignore-duplicates' : ''
      }`,
    })
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    const data = await res.json()
    throw new SupabaseResponse({ data: { count: data.length } })
  }

const singly = (
  data: SupabaseResponse['data'][],
): SupabaseResponse['data'] | undefined => {
  return data[0]
}

const getTableAndMethod = (
  clientMethod: string,
  modelMapper: Record<string, string>,
): [string, string] => {
  const [t = '', method = ''] = clientMethod.split('.')
  const table = modelMapper[t]
  // TODO
  if (!table) throw new Error('')

  return [table, method]
}
