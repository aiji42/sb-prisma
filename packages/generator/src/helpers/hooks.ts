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
    isList,
  }: {
    args?: Args
    typeName: string
    isList: boolean
  }) => {
    const res = await fetcher(args, typeName, modelMapper)
    if (!res.ok) throw new SupabaseResponse({ error: await res.json() })
    throw new SupabaseResponse({ data: filter(await res.json(), isList) })
  },
})

const filter = (
  data: SupabaseResponse['data'][],
  isList: boolean,
): SupabaseResponse['data'] | undefined => {
  return isList ? data : data[0]
}
