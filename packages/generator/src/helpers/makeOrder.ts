import { Args } from './types'

export const makeOrder = (args: Args) => {
  if (!args.orderBy) return ''
  const orderBy = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy]
  return orderBy
    .flatMap((orders) => {
      return Object.entries(orders).map(([col, sort]) => `${col}.${sort}`)
    })
    .join(',')
}
