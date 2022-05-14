import { QueryBuilder } from './QueryBuilder'
import { DataModel } from './DataModel'
import { DMMF } from '@prisma/generator-helper'
import { Args } from '../types'
import { v4 as uuid } from 'uuid'
import crossFetch from 'cross-fetch'
import { SBPrismaAPIError, SBPrismaError } from './SBPrismaError'

type Fetch = typeof fetch

export class RequestBuilder {
  queryBuilder: QueryBuilder
  doc: DataModel

  constructor(
    dataModel: DMMF.Datamodel,
    private _endpoint: string,
    private _apikey: string,
  ) {
    this.queryBuilder = new QueryBuilder(dataModel)
    this.doc = this.queryBuilder.doc
  }

  public build(args: Args, model: string, action: string) {
    const url = new URL(`${this._endpoint}`)
    url.pathname = `/rest/v1/${this.doc.model(model).table}`
    url.search = String(this.queryBuilder.setup(args, model))

    const headers = {
      apikey: this._apikey,
      Authorization: `Bearer ${this._apikey}`,
      'Content-Type': 'application/json',
    }

    if (['findFirst', 'findUnique', 'findMany'].includes(action)) {
      return findRequest(url, headers)
    }
    if (['delete', 'deleteMany'].includes(action)) {
      return deleteRequest(url, headers)
    }
    if (['update', 'updateMany'].includes(action)) {
      return updateRequest(url, headers, args, model, this.doc)
    }
    if (['create', 'createMany'].includes(action)) {
      return createRequest(url, headers, args, model, this.doc)
    }

    throw new SBPrismaError(`Action ${action} is not yet supported.`)
  }

  public async execute(args: Args, model: string, action: string) {
    const req = this.build(args, model, action)
    const res = await (typeof fetch === 'undefined' ? crossFetch : fetch)(
      ...req,
    )
    return await afterHandler(res, action)
  }

  set apikey(key: string) {
    this._apikey = key
  }
}

const autoUpdatedAt = (model: string, data: Args['data'], doc: DataModel) => {
  if (!data) return data
  const now = new Date()
  const filler = doc
    .model(model)
    .fields.reduce<Record<string, Date>>((res, field) => {
      if (
        !(
          field.isUpdatedAt &&
          typeof field.default === 'object' &&
          field.default.name === 'now'
        )
      )
        return res
      return { ...res, [field.name]: now }
    }, {})

  if (Array.isArray(data)) return data.map((d) => ({ ...filler, ...d }))
  return { ...filler, ...data }
}

const autoId = (model: string, data: Args['data'], doc: DataModel) => {
  if (!data) return data
  const columns = doc.model(model).fields.reduce<string[]>((res, field) => {
    if (typeof field.default !== 'object') return res
    if (field.default.name === 'uuid') return [...res, field.name]
    if (field.default.name === 'cuid')
      throw new SBPrismaError(
        'Not supported `@default(cuid())`. Please use `@default(uuid())`',
      )
    return res
  }, [])
  if (columns.length < 1) return data

  if (Array.isArray(data))
    return data.map((d) => ({
      ...Object.fromEntries(columns.map((col) => [col, uuid()])),
      ...d,
    }))

  return { ...Object.fromEntries(columns.map((col) => [col, uuid()])), ...data }
}

const findRequest = (url: URL, headers: HeadersInit): Parameters<Fetch> => {
  return [
    url.toString(),
    {
      method: 'GET',
      headers,
    },
  ]
}

const deleteRequest = (url: URL, headers: HeadersInit): Parameters<Fetch> => {
  return [
    url.toString(),
    {
      method: 'DELETE',
      headers: { ...headers, Prefer: 'return=representation' },
    },
  ]
}

const updateRequest = (
  url: URL,
  headers: HeadersInit,
  { data }: Args,
  model: string,
  doc: DataModel,
): Parameters<Fetch> => {
  return [
    url.toString(),
    {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(autoUpdatedAt(model, data, doc)),
    },
  ]
}

const createRequest = (
  url: URL,
  headers: HeadersInit,
  { data, skipDuplicates }: Args,
  model: string,
  doc: DataModel,
): Parameters<Fetch> => {
  return [
    url.toString(),
    {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: `return=representation${
          skipDuplicates ? ',resolution=ignore-duplicates' : ''
        }`,
      },

      body: JSON.stringify(autoId(model, data, doc)),
    },
  ]
}

const singly = (data: unknown[]): unknown | undefined => {
  return data[0]
}

const afterHandler = async (res: Response, action: string) => {
  if (!res.ok) throw new SBPrismaAPIError(await res.json())

  if (
    ['findFirst', 'findUnique', 'delete', 'update', 'create'].includes(action)
  ) {
    return singly(await res.json())
  }
  if (action === 'findMany') {
    return await res.json()
  }
  if (['deleteMany', 'updateMany', 'createMany'].includes(action)) {
    return { count: (await res.json()).length }
  }

  throw new SBPrismaError(`Action ${action} is not yet supported.`)
}
