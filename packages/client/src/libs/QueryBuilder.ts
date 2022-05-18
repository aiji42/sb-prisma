import { Args, ArgsFlatten, Select, SelectFlatten } from '../types'
import { DMMF } from '@prisma/generator-helper'
import { DataModel } from './DataModel'
import { makeSelect } from '../helpers/makeSelect'
import { makeWhere } from '../helpers/makeWhere'
import { makeOrder } from '../helpers/makeOrder'

export class QueryBuilder {
  doc: DataModel
  args: Args = {}
  argsFlattens: ArgsFlatten[] = []
  rootModel: string

  constructor(dataModel: DMMF.Document['datamodel']) {
    this.doc = new DataModel(dataModel)
  }

  setup(args: Args, model: string) {
    this.args = args
    this.rootModel = model
    this.argsFlattens = flat(this.rootModel, this.args, '', this.doc)
    return this
  }

  public toString() {
    return this.query.toString()
  }

  get query() {
    const params = new URLSearchParams()
    params.append('select', this.select)
    this.wheres.forEach(([prefix, where]) => {
      params.append(prefix ? `${prefix}.and` : 'and', `(${where})`)
    })
    this.orders.forEach(([prefix, order]) => {
      params.append(prefix ? `${prefix}.order` : 'order', order)
    })
    this.limits.forEach(([prefix, limit]) => {
      params.append(prefix ? `${prefix}.limit` : 'limit', limit)
    })
    this.offset.forEach(([prefix, offset]) => {
      params.append(prefix ? `${prefix}.offset` : 'offset', offset)
    })

    return params
  }

  get select(): string {
    return makeSelect(this.args, this.rootModel, this.doc)
  }

  get wheres(): [string, string][] {
    return this.argsFlattens.reduce<[string, string][]>(
      (res, { model, prefix, ...args }) => {
        const where = makeWhere(args, model, this.doc)
        return where ? [...res, [prefix, where]] : res
      },
      [],
    )
  }
  get orders(): [string, string][] {
    return this.argsFlattens.reduce<[string, string][]>(
      (res, { prefix, ...args }) => {
        const order = makeOrder(args)
        return order ? [...res, [prefix, order]] : res
      },
      [],
    )
  }
  get limits(): [string, string][] {
    return this.argsFlattens.reduce<[string, string][]>(
      (res, { prefix, take }) => {
        return typeof take === 'number' ? [...res, [prefix, String(take)]] : res
      },
      [],
    )
  }
  get offset(): [string, string][] {
    return this.argsFlattens.reduce<[string, string][]>(
      (res, { prefix, skip }) => {
        return typeof skip === 'number' ? [...res, [prefix, String(skip)]] : res
      },
      [],
    )
  }
}

const flat = (
  model: string,
  args: Args,
  prefix: string,
  doc: DataModel,
): ArgsFlatten[] => {
  const { select = {}, data, skipDuplicates, ...rest } = args
  if (select._count) {
    return flat(model, { select: select._count.select, ...rest }, prefix, doc)
  }
  const [rootSelects, children] = Object.entries(select).reduce<
    [SelectFlatten, Select]
  >(
    (res, [columnOrModel, fields]) => {
      const [root, children] = res
      if (
        columnOrModel === '_all' ||
        doc.model(model).field(columnOrModel).kind !== 'object'
      )
        return [{ ...root, [columnOrModel]: fields as boolean }, children]
      return [root, { ...children, [columnOrModel]: fields }]
    },
    [{}, {}],
  )

  return [
    {
      select: rootSelects,
      ...rest,
      prefix,
      model,
    },
    ...Object.entries(children).flatMap(([alias, child]) =>
      flat(
        doc.model(model).field(alias).type,
        child as Args,
        prefix ? `${prefix}.${alias}` : alias,
        doc,
      ),
    ),
  ]
}
