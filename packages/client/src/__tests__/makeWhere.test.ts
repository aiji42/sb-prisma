import { makeWhere } from '../helpers/makeWhere'
import { Args, Models } from '../types'

const models = {
  User: {
    fields: {
      id: { isList: false },
      name: { isList: false },
      labels: { isList: true },
      languages: { isList: true },
      tags1: { isList: true },
      tags2: { isList: true },
      tags3: { isList: true },
    },
  },
} as unknown as Models

test('make where statement', () => {
  expect(
    makeWhere({ where: { id: 1, name: { in: ['a', 'b', 'c'] } } }, 'User', {
      models,
    }),
  ).toEqual('id.eq.1,name.in.("a","b","c")')
})

test('make where statement with not operator', () => {
  expect(
    makeWhere({ where: { name: { not: null } } }, 'User', {
      models,
    }),
  ).toEqual('name.not.is.null')
})

test('make where statement with OR and NOT operator', () => {
  expect(
    makeWhere(
      {
        where: {
          OR: [
            { name: { startsWith: 'a' } },
            { name: { endsWith: 'b' } },
            { name: { contains: 'c', mode: 'insensitive' } },
          ],
          NOT: [{ id: { gt: 10 } }, { id: { lt: 100 } }],
        } as Args['where'],
      },
      'User',
      {
        models,
      },
    ),
  ).toEqual(
    'or(name.like.a*,name.like.*b,name.ilike.*c*),not.and(id.gt.10,id.lt.100)',
  )
})

test('make where statement with list field operator', () => {
  expect(
    makeWhere(
      {
        where: {
          labels: { has: 'a' },
          languages: { hasSome: ['a'] },
          tags1: { hasEvery: ['a', 'b'] },
          tags2: { isEmpty: true },
          tags3: { equals: 'c' },
        },
      },
      'User',
      {
        models,
      },
    ),
  ).toEqual(
    'labels.cs.{"a"},languages.ov.{"a"},tags1.cs.{"a","b"},tags2.eq.{},tags3.eq.{"c"}',
  )
})
