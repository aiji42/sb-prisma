import { makeWhere } from '../helpers/makeWhere'
import { Args } from '../types'
import { DMMF } from '@prisma/generator-helper'
import { DataModel } from '../libs/DataModel'

const models = {
  models: [
    {
      name: 'User',
      fields: [
        { name: 'id', isList: false },
        { name: 'name', isList: false },
        { name: 'labels', isList: true },
        { name: 'languages', isList: true },
        { name: 'tags1', isList: true },
        { name: 'tags2', isList: true },
        { name: 'tags3', isList: true },
      ],
    },
  ],
} as DMMF.Document['datamodel']
const doc = new DataModel(models)

test('make where statement', () => {
  expect(
    makeWhere({ where: { id: 1, name: { in: ['a', 'b', 'c'] } } }, 'User', doc),
  ).toEqual('id.eq.1,name.in.("a","b","c")')
})

test('make where statement with not operator', () => {
  expect(makeWhere({ where: { name: { not: null } } }, 'User', doc)).toEqual(
    'name.not.is.null',
  )
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
      doc,
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
      doc,
    ),
  ).toEqual(
    'labels.cs.{"a"},languages.ov.{"a"},tags1.cs.{"a","b"},tags2.eq.{},tags3.eq.{"c"}',
  )
})
