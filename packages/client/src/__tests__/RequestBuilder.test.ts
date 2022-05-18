import { getSampleDMMF } from './__fixtures__/getSampleSchema'
import { RequestBuilder } from '../libs/RequestBuilder'
import { Where } from '../types'
import crossFetch from 'cross-fetch'

jest.mock('cross-fetch', () => {
  //Mock the default export
  return {
    __esModule: true,
    default: jest.fn(),
  }
})

jest.mock('uuid', () => ({
  v4: () => {
    return 'this is uuid mocked value'
  },
}))

beforeEach(() => {
  const fixed = new Date('2022-05-10T00:00:00')
  jest.useFakeTimers().setSystemTime(fixed.getTime())
})

afterEach(() => {
  jest.useRealTimers()
  jest.resetAllMocks()
})

test('RequestBuilder; build - findMany', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  const req = queryBuilder.build(
    {
      select: { name: true },
      where: {
        name: { startsWith: 'F' },
        OR: [{ id: { gt: 10, lt: 20 } }, { id: { gte: 110, lte: 120 } }],
      } as Where,
      take: 10,
      skip: 100,
    },
    'User',
    'findMany',
  )

  expect(req).toMatchSnapshot()
})

test('RequestBuilder; build - count', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  const req = queryBuilder.build(
    {
      select: { name: true, _all: true },
      where: {
        NOT: [
          { name: { startsWith: 'z' } },
          { name: { not: { equals: 'a' } } },
        ],
      } as Where,
    },
    'Team',
    'count',
  )

  expect(req).toMatchSnapshot()
})

test('RequestBuilder; build - creatMany', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  const req = queryBuilder.build(
    {
      data: [{ name: 'Foo' }, { name: 'Baa' }],
    },
    'User',
    'createMany',
  )

  expect(req).toMatchSnapshot()
})

test('RequestBuilder; build - creatMany with skipDuplicates', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  const req = queryBuilder.build(
    {
      data: [{ name: 'Foo' }, { name: 'Baa' }],
      skipDuplicates: true,
    },
    'User',
    'createMany',
  )

  expect(req).toMatchSnapshot()
})

test('RequestBuilder; build - updateMany', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  const req = queryBuilder.build(
    {
      data: { name: 'Foo' },
      where: {
        name: { not: { startsWith: 'Foo' } },
      },
    },
    'User',
    'updateMany',
  )

  expect(req).toMatchSnapshot()
})

test('RequestBuilder; build - deleteMany', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  const req = queryBuilder.build(
    {
      where: {
        name: { not: { startsWith: 'Foo' } },
      },
    },
    'User',
    'deleteMany',
  )

  expect(req).toMatchSnapshot()
})

test('RequestBuilder; execute - findMany', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  ;(crossFetch as jest.Mock).mockResolvedValue({
    status: 200,
    ok: true,
    json: () => [
      {
        id: 'aaaa',
        name: 'Foo',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bbbb',
        name: 'Boo',
        updatedAt: new Date().toISOString(),
      },
    ],
  })

  const res = await queryBuilder.execute(
    { select: { id: true, name: true, updatedAt: true } },
    'User',
    'findMany',
  )

  expect(res).toMatchSnapshot()
})

test('RequestBuilder; execute - findFirst', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  ;(crossFetch as jest.Mock).mockResolvedValue({
    status: 200,
    ok: true,
    json: () => [
      {
        id: 'aaaa',
        name: 'Foo',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bbbb',
        name: 'Boo',
        updatedAt: new Date().toISOString(),
      },
    ],
  })

  const res = await queryBuilder.execute(
    { select: { id: true, name: true, updatedAt: true } },
    'User',
    'findFirst',
  )

  expect(res).toMatchSnapshot()
})

test('RequestBuilder; execute - deleteMany', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  ;(crossFetch as jest.Mock).mockResolvedValue({
    status: 200,
    ok: true,
    json: () => [
      {
        id: 'aaaa',
        name: 'Foo',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bbbb',
        name: 'Boo',
        updatedAt: new Date().toISOString(),
      },
    ],
  })

  const res = await queryBuilder.execute({}, 'User', 'deleteMany')

  expect(res).toMatchSnapshot()
})

test('RequestBuilder; execute - updateMany', async () => {
  const queryBuilder = new RequestBuilder(
    (await getSampleDMMF()).datamodel,
    'https://example.com',
    'apikey',
  )
  ;(crossFetch as jest.Mock).mockResolvedValue({
    status: 200,
    ok: true,
    json: () => [
      {
        id: 'aaaa',
        name: 'Foo',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bbbb',
        name: 'Boo',
        updatedAt: new Date().toISOString(),
      },
    ],
  })

  const res = await queryBuilder.execute({}, 'User', 'updateMany')

  expect(res).toMatchSnapshot()
})
