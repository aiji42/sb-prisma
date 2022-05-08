import { Args, ModelMapping } from '../types'
import { makeSelect } from './makeSelect'
import { makeOrder } from './makeOrder'
import { makeWhere } from './makeWhere'

export type Fetch = typeof fetch
export type Fetcher = (
  args: Args,
  method: string,
  model: string,
  modelMapping: ModelMapping,
  headers?: Record<string, string>,
) => Promise<Response>

export const makeFetcher = (
  endpoint: string,
  apikey: string,
  fetch: Fetch,
): Fetcher => {
  return (args, method, model, modelMap, headers) => {
    const select = makeSelect(args, model, modelMap)
    const orderBy = makeOrder(args)
    const where = makeWhere(args)

    const url = new URL(endpoint)
    url.pathname = `/rest/v1/${modelMap.models[model]?.dbName ?? model}`
    url.searchParams.append('select', select)
    where && url.searchParams.append('and', `(${where})`)
    orderBy && url.searchParams.append('order', orderBy)
    args.take && url.searchParams.append('limit', args.take.toString())
    args.skip && url.searchParams.append('offset', args.skip.toString())

    return fetch(url.toString(), {
      method,
      headers: {
        apikey,
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(args.data &&
        ['POST', 'PATCH'].includes(method) && {
          body: JSON.stringify(args.data),
        }),
    })
  }
}
