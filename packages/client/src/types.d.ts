export type Scalar = number | string | boolean | null

export type Operators = {
  equals?: Scalar | Scalar[]
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

  has?: Scalar
  hasEvery?: Scalar | Scalar[]
  hasSome?: Scalar | Scalar[]
  isEmpty?: boolean
}

export type NegativeOperators = {
  not?: Omit<Operators, 'mode'> | Scalar
}

type Select = {
  _count?: { select: Select }
  [x: string]: boolean | Args
}
type SelectFlatten = Record<string, boolean>

export type Where = {
  [field: string]: (Operators & NegativeOperators) | Scalar
}

type OrderBy = Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]

export type Args = {
  select?: Select
  take?: number
  skip?: number
  orderBy?: OrderBy
  where?: Where & {
    AND?: Where[] | Where
    OR?: Where[] | Where
    NOT?: Where[] | Where
  }
  data?: Record<string, unknown> | Record<string, unknown>[]
  skipDuplicates?: boolean
}

export type ArgsFlatten = {
  select?: SelectFlatten
  take?: number
  skip?: number
  orderBy?: OrderBy
  where?: Where & {
    AND?: Where[] | Where
    OR?: Where[] | Where
    NOT?: Where[] | Where
  }
  model: string
  prefix: string
}
