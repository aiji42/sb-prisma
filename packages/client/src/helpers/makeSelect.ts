import { Args, ModelMapping } from '../types'

export const makeSelect = (
  args: Args,
  model: string,
  { models }: Pick<ModelMapping, 'models'>,
): string => {
  if (!args.select) return '*'
  return Object.entries(args.select)
    .filter(([, v]) => v)
    .map(([alias, v]) => {
      const rm = models[model]?.fields?.[alias]
      if (rm?.kind !== 'object') return alias

      const search = `${alias}:${models[rm.type]?.dbName ?? rm.type}`
      return `${search}(${makeSelect(typeof v === 'object' ? v : {}, rm.type, {
        models,
      })})`
    })
    .join(',')
}
