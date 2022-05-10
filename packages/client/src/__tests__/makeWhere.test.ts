import { makeWhere } from '../helpers/makeWhere'
import { Args, Where } from '../types'
import { DMMF } from '@prisma/generator-helper'
import { DataModel } from '../libs/DataModel'
import { text } from 'stream/consumers'

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

test('makeWhere', () => {
  expect(
    makeWhere({ where: { id: 1, name: { in: ['a', 'b', 'c'] } } }, 'User', doc),
  ).toEqual('id.eq.1,name.in.("a","b","c")')
})

test('makeWhere with not operator', () => {
  expect(makeWhere({ where: { name: { not: null } } }, 'User', doc)).toEqual(
    'name.not.is.null',
  )
})

test('makeWhere with OR and NOT operator', () => {
  expect(
    makeWhere(
      {
        where: {
          OR: [
            { name: { startsWith: 'a' } },
            { name: { endsWith: 'b' } },
            { name: { contains: 'c', mode: 'insensitive' }, id: { gt: 3 } },
            { id: { gt: 10, lt: 20 } },
          ],
          NOT: [{ id: { gt: 10 } }, { id: { lt: 100 } }],
        } as Args['where'],
      },
      'User',
      doc,
    ),
  ).toEqual(
    'or(name.like.a*,name.like.*b,and(name.ilike.*c*,id.gt.3),and(id.lt.20,id.gt.10)),not.and(id.gt.10,id.lt.100)',
  )
})

test('makeWhere with list field operator', () => {
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

test('makeWhere do not query empty OR/AND/NOT', () => {
  expect(
    makeWhere(
      {
        where: {
          OR: [],
          AND: [],
          NOT: { id: 1, NOT: [], OR: [{ id: 2 }, { id: 3 }] },
        } as Where,
      },
      'User',
      doc,
    ),
  ).toEqual('not.and(or(id.eq.2,id.eq.3),id.eq.1)')
})
