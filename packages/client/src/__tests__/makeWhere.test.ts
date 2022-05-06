import { makeWhere } from '../helpers/makeWhere'
import { Args } from '../types'

test('make where statement', () => {
  expect(
    makeWhere({ where: { id: 1, name: { in: ['a', 'b', 'c'] } } }),
  ).toEqual('id.eq.1,name.in.("a","b","c")')
})

test('make where statement with not operator', () => {
  expect(makeWhere({ where: { name: { not: null } } })).toEqual(
    'name.not.is.null',
  )
})

test('make where statement with OR and NOT operator', () => {
  expect(
    makeWhere({
      where: {
        OR: [
          { name: { startsWith: 'a' } },
          { name: { endsWith: 'b' } },
          { name: { contains: 'c', mode: 'insensitive' } },
        ],
        NOT: [{ id: { gt: 10 } }, { id: { lt: 100 } }],
      } as Args['where'],
    }),
  ).toEqual(
    'or(name.like.a*,name.like.*b,name.ilike.*c*),not.and(id.gt.10,id.lt.100)',
  )
})
