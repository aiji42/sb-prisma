import { Args } from './types'
import { makeSelect } from './makeSelect'
import { makeOrder } from './makeOrder'
import { makeWhere } from './makeWhere'

export type Fetch = typeof fetch
export type Fetcher = (
  args: Args,
  table: string,
  modelMap?: Record<string, string>,
) => Promise<Response>

export const makeFetcher = (
  endpoint: string,
  apikey: string,
  fetch: Fetch,
): Fetcher => {
  return (args: Args, table: string, modelMap: Record<string, string> = {}) => {
    const select = makeSelect(args, table, modelMap)
    const orderBy = makeOrder(args)
    const where = makeWhere(args)

    const url = new URL(endpoint)
    url.pathname = `/rest/v1/${table}`
    url.searchParams.append('select', select)
    where && url.searchParams.append('and', `(${where})`)
    orderBy && url.searchParams.append('order', orderBy)
    args.take && url.searchParams.append('limit', args.take.toString())
    args.skip && url.searchParams.append('offset', args.skip.toString())

    return fetch(url.toString(), {
      headers: {
        apikey,
        Authorization: `Bearer ${apikey}`,
      },
    })
  }
}
