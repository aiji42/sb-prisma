import { Args } from '../types'
import { DataModel } from '../libs/DataModel'

export const makeSelect = (
  args: Args,
  model: string,
  doc: DataModel,
): string => {
  if (!args.select) return '*'
  if (args.select._count) return makeSelect(args.select._count, model, doc)
  return (
    Object.entries(args.select)
      .filter(([k, v]) => v && k !== '_all')
      .map(([alias, children]) => {
        const field = doc.model(model).field(alias)
        if (field.kind !== 'object') return alias

        const search = `${alias}:${doc.model(field.type).table}`
        return `${search}(${makeSelect(
          typeof children === 'object' ? children : {},
          field.type,
          doc,
        )})`
      })
      .join(',') || '*'
  )
}
