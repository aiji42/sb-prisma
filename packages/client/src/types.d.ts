import { DMMF } from '@prisma/generator-helper'

export type Scalar = number | string | boolean | null

export type Operators = {
  equals?: Scalar
  in?: Scalar[]
  notIn?: Scalar[]
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  contains?: string
  mode?: 'default' | 'insensitive'
  startsWith?: string
  endsWith?: string
}

export type NegativeOperators = {
  not?: Omit<Operators, 'mode'> | Scalar
}

type Select = Record<string, boolean | Args>

export type Where = {
  [field: string]: (Operators & NegativeOperators) | Scalar
}

export type Args = {
  select?: Select
  take?: number
  skip?: number
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]
  where?: Where & {
    AND?: Where[] | Where
    OR?: Where[] | Where
    NOT?: Where[] | Where
  }
  data?: Record<string, unknown> | Record<string, unknown>[]
  skipDuplicates?: boolean
}

export type Models = Record<
  string,
  Omit<DMMF.Model, 'fields'> & {
    fields: {
      [name: string]: DMMF.Field
    }
  }
>

export type ModelMapping = {
  operationMapping: Record<string, { model: string; method: string }>
  models: Models
}
