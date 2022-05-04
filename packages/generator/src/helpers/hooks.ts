import { Args } from './types'
import SupabaseResponse from '../response/SupabaseResponse'
import { Fetcher } from './makeFetcher'

export const makeHooks = (
  fetcher: Fetcher,
  modelMapper: Record<string, string>,
) => ({
  beforeRequest: async ({
    args = {},
    typeName,
  }: {
    args?: Args
    typeName: string
  }) => {
    const res = await fetcher(args, typeName, modelMapper)
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    throw new SupabaseResponse({ data: await res.json() })
  },
})
