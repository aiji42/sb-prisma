import { makeHooks } from './helpers/makeHooks'
import { makeFetcher, Fetch } from './helpers/makeFetcher'
import SupabaseResponse from './response/SupabaseResponse'
import { ModelMapping } from './types'

let _modelMap: undefined | ModelMapping
let _endpoint: undefined | string
let _apikey: undefined | string
let _fetch: undefined | Fetch

export const prepare = ({
  endpoint,
  apikey,
  fetch,
  modelMap,
}: {
  endpoint?: string
  apikey?: string
  fetch: Fetch
  modelMap: ModelMapping
}) => {
  if (!endpoint)
    throw new Error(
      '@sb-prisma/client Error: `endpoint` is unset or invalid. Please check the documentation. https://github.com/aiji42/sb-prisma#install--setup',
    )
  if (!apikey)
    throw new Error(
      '@sb-prisma/client Error: `apikey` is unset or invalid. Please check the documentation. https://github.com/aiji42/sb-prisma#install--setup',
    )
  _endpoint = endpoint
  _apikey = apikey
  _fetch = fetch
  _modelMap = modelMap
}

export const createClient = <T>(_PrismaClient: any): T => {
  if (!(_modelMap && _endpoint && _apikey && _fetch))
    throw new Error(
      '@sb-prisma/client Error: Initialize the configuration by `prepare` method',
    )
  const fetcher = makeFetcher(_endpoint, _apikey, _fetch)
  return new _PrismaClient({
    __internal: {
      hooks: makeHooks(fetcher, _modelMap),
    },
  })
}

const handler = (res: unknown) => {
  if (res instanceof SupabaseResponse) {
    if (res.error) {
      console.error(`@sb-prisma/client Error: ${res.error.message}`)
      throw res.error
    }
    return res.data
  }
  throw res
}

export const sb = async <T>(prismaPromise: Promise<T>): Promise<T> => {
  return prismaPromise.catch(handler) as Promise<T>
}
