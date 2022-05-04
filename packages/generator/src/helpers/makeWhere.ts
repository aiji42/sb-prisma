import { Args, NegativeOperators, Operators, Scalar, Where } from './types'

// TODO: related table
export const makeWhere = (arg: Args) => {
  if (!arg.where) return ''
  const { AND, OR, NOT, ...rest } = arg.where
  let where = []
  if (AND) where.push(_AND(AND))
  if (OR) where.push(_OR(OR))
  if (NOT) where.push(_NOT(NOT))
  const restStatement = Object.entries(rest)
    .flatMap(([col, cond]) => {
      const s = []
      if (cond === null || typeof cond !== 'object') return _equals(col, cond)
      if (cond.equals !== undefined) s.push(_equals(col, cond.equals))
      if (cond.in !== undefined) s.push(_in(col, cond.in))
      if (cond.notIn !== undefined) s.push(_notIn(col, cond.notIn))
      if (cond.lt !== undefined) s.push(_lt(col, cond.lt))
      if (cond.lte !== undefined) s.push(_lte(col, cond.lte))
      if (cond.gt !== undefined) s.push(_gt(col, cond.gt))
      if (cond.gte !== undefined) s.push(_gte(col, cond.gte))
      if (cond.contains !== undefined)
        s.push(_contains(col, cond.contains, cond.mode))
      if (cond.startsWith !== undefined)
        s.push(_startsWith(col, cond.startsWith, cond.mode))
      if (cond.endsWith !== undefined)
        s.push(_endsWith(col, cond.endsWith, cond.mode))
      if (cond.not !== undefined) s.push(_not(col, cond.not, cond.mode))
      return s
    })
    .join(',')
  if (restStatement) where.push(restStatement)
  return where.join(',')
}

const _AND = (condition: Where[] | Where): string => {
  const cond = Array.isArray(condition) ? condition : [condition]
  return `and(${cond.map((where) => makeWhere({ where })).join(',')})`
}

const _OR = (condition: Where[] | Where): string => {
  const cond = Array.isArray(condition) ? condition : [condition]
  return `or(${cond.map((where) => makeWhere({ where })).join(',')})`
}

const _NOT = (condition: Where[] | Where): string => {
  const cond = Array.isArray(condition) ? condition : [condition]
  return `not.and(${cond.map((where) => makeWhere({ where })).join(',')})`
}

const _equals = (col: string, condition: Required<Operators['equals']>) => {
  if (typeof condition === 'boolean' || condition === null)
    return `${col}.is.${condition}`
  return `${col}.eq.${condition}`
}

const _notEquals = (col: string, condition: Required<Operators['equals']>) => {
  if (typeof condition === 'boolean' || condition === null)
    return `${col}.not.is.${condition}`
  return `${col}.neq.${condition}`
}

const _in = (col: string, condition: Required<Operators['in']>) => {
  return `${col}.in.(${JSON.stringify(condition).replace(/^\[|]$/g, '')})`
}

const _notIn = (col: string, condition: Required<Operators['notIn']>) => {
  return `${col}.not.in.(${JSON.stringify(condition).replace(/^\[|]$/g, '')})`
}

const _lt = (col: string, condition: Required<Operators['lt']>) => {
  return `${col}.lt.${condition}`
}

const _notLt = (col: string, condition: Required<Operators['lt']>) => {
  return `${col}.not.lt.${condition}`
}

const _lte = (col: string, condition: Required<Operators['lte']>) => {
  return `${col}.lte.${condition}`
}

const _notLte = (col: string, condition: Required<Operators['lte']>) => {
  return `${col}.not.lte.${condition}`
}

const _gt = (col: string, condition: Required<Operators['gt']>) => {
  return `${col}.gt.${condition}`
}

const _notGt = (col: string, condition: Required<Operators['gt']>) => {
  return `${col}.not.gt.${condition}`
}

const _gte = (col: string, condition: Required<Operators['gte']>) => {
  return `${col}.gte.${condition}`
}

const _notGte = (col: string, condition: Required<Operators['gte']>) => {
  return `${col}.not.gte.${condition}`
}

// TODO: Filters for list-type columns
const _contains = (
  col: string,
  condition: Required<Operators['contains']>,
  mode?: 'default' | 'insensitive',
) => {
  return `${col}.${mode === 'insensitive' ? 'ilike' : 'like'}.*${condition}*`
}

const _notContains = (
  col: string,
  condition: Required<Operators['contains']>,
  mode?: 'default' | 'insensitive',
) => {
  return `${col}.not.${
    mode === 'insensitive' ? 'ilike' : 'like'
  }.*${condition}*`
}

const _startsWith = (
  col: string,
  condition: Required<Operators['startsWith']>,
  mode?: 'default' | 'insensitive',
) => {
  return `${col}.${mode === 'insensitive' ? 'ilike' : 'like'}.${condition}*`
}

const _notStartsWith = (
  col: string,
  condition: Required<Operators['startsWith']>,
  mode?: 'default' | 'insensitive',
) => {
  return `${col}.not.${mode === 'insensitive' ? 'ilike' : 'like'}.${condition}*`
}

const _endsWith = (
  col: string,
  condition: Required<Operators['endsWith']>,
  mode?: 'default' | 'insensitive',
) => {
  return `${col}.${mode === 'insensitive' ? 'ilike' : 'like'}.*${condition}`
}

const _notEndsWith = (
  col: string,
  condition: Required<Operators['endsWith']>,
  mode?: 'default' | 'insensitive',
) => {
  return `${col}.not.${mode === 'insensitive' ? 'ilike' : 'like'}.*${condition}`
}

const _not = (
  col: string,
  condition: Scalar | (Omit<Operators, 'mode'> & NegativeOperators),
  mode?: 'default' | 'insensitive',
): string => {
  if (condition === null || typeof condition !== 'object')
    return _notEquals(col, condition)
  const s = []
  if (condition.equals !== undefined) s.push(_notEquals(col, condition.equals))
  if (condition.in !== undefined) s.push(_notIn(col, condition.in))
  if (condition.notIn !== undefined) s.push(_in(col, condition.notIn))
  if (condition.lt !== undefined) s.push(_notLt(col, condition.lt))
  if (condition.lte !== undefined) s.push(_notLte(col, condition.lte))
  if (condition.gt !== undefined) s.push(_notGt(col, condition.gt))
  if (condition.gte !== undefined) s.push(_notGte(col, condition.gte))
  if (condition.contains !== undefined)
    s.push(_notContains(col, condition.contains, mode))
  if (condition.startsWith !== undefined)
    s.push(_notStartsWith(col, condition.startsWith, mode))
  if (condition.endsWith !== undefined)
    s.push(_notEndsWith(col, condition.endsWith, mode))
  if (condition.not !== undefined) s.push(_not(col, !condition.not, mode))
  return s.join(',')
}