import { Args, ModelMapping } from './types'

export const makeSelect = (
  args: Args,
  model: string,
  modelMap: ModelMapping,
): string => {
  if (!args.select) return '*'
  return Object.entries(args.select)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const relatedModel = modelMap.relationMapping[model]?.[k]
      if (!relatedModel) return k

      const alias = `${k}:${
        modelMap.tableMapping[relatedModel] ?? relatedModel
      }`
      return `${alias}(${makeSelect(
        typeof v === 'object' ? v : {},
        relatedModel,
        modelMap,
      )})`
    })
    .join(',')
}
