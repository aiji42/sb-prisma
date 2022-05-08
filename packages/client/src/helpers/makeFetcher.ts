import {
  Args,
  ArgsFlatten,
  ModelMapping,
  Select,
  SelectFlatten,
} from '../types'
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
    const url = new URL(endpoint)
    url.pathname = `/rest/v1/${modelMap.models[model]?.dbName ?? model}`
    url.searchParams.append('select', makeSelect(args, model, modelMap))

    flatArgs(args, model, modelMap, true).forEach(
      ({ prefix, take, skip, ...rest }) => {
        const orderBy = makeOrder(rest)
        const where = makeWhere(rest, model, modelMap)
        where &&
          url.searchParams.append(
            prefix ? `${prefix}.and` : 'and',
            `(${where})`,
          )
        orderBy &&
          url.searchParams.append(prefix ? `${prefix}.order` : 'order', orderBy)
        take &&
          url.searchParams.append(
            prefix ? `${prefix}.limit` : 'limit',
            take.toString(),
          )
        skip &&
          url.searchParams.append(
            prefix ? `${prefix}.offset` : 'offset',
            skip.toString(),
          )
      },
    )

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

const flatArgs = (
  args: Args,
  model: string,
  { models }: Pick<ModelMapping, 'models'>,
  root: boolean,
  parent?: string,
): ArgsFlatten[] => {
  const { select = {}, data, skipDuplicates, ...rest } = args
  const [rootSelects, children] = Object.entries(select).reduce<
    [SelectFlatten, Select]
  >(
    (res, [column, fields]) => {
      const [root, children] = res
      if (models[model]?.fields[column]?.kind !== 'object')
        return [{ ...root, [column]: fields as boolean }, children]
      return [root, { ...children, [column]: fields }]
    },
    [{}, {}],
  )

  const tableName = models[model]?.dbName ?? model
  return [
    {
      select: rootSelects,
      ...rest,
      prefix: root ? '' : !parent ? tableName : `${parent}.${tableName}`,
    },
    ...Object.entries(children).flatMap(([modelName, child]) =>
      flatArgs(
        typeof child === 'boolean' ? {} : child,
        modelName,
        { models },
        false,
        parent,
      ),
    ),
  ]
}
