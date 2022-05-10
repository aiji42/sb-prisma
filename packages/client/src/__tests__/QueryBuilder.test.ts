import { QueryBuilder } from '../libs/QueryBuilder'
import { getSampleDMMF } from './__fixtures__/getSampleSchema'
import { Where } from '../types'

test('QueryBuilder .query', async () => {
  const queryBuilder = new QueryBuilder((await getSampleDMMF()).datamodel)
  const qb = queryBuilder.setup(
    {
      select: {
        id: true,
        Team: {
          select: { users: { where: { id: { gte: 100 } } } },
          where: { id: 10 },
        },
      },
      where: {
        id: 1,
        name: { startsWith: 'a' },
        OR: [
          { name: { contains: 'aa', mode: 'insensitive' } },
          { name: { contains: 'bb', mode: 'insensitive' } },
        ],
      } as Where,
      orderBy: [{ name: 'asc' }, { id: 'desc' }],
      take: 10,
      skip: 20,
    },
    'User',
  )
  expect(qb.query).toMatchSnapshot()
})
