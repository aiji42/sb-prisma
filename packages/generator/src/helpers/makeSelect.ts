import { Args } from './types'

export const makeSelect = (
  args: Args,
  rootField: string,
  modelMap: Record<string, string>,
): string => {
  if (!args.select) return '*'
  return Object.entries(args.select)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const model = modelMap[`${rootField}.${k}`]
      if (!model) return k
      const alias = `${k}:${model}`
      return `${alias}(${makeSelect(
        typeof v === 'object' ? v : {},
        model || k,
        modelMap,
      )})`
    })
    .join(',')
}
