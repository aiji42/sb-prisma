import { makeHooks } from '../helpers/makeHooks'
import SupabaseResponse from '../response/SupabaseResponse'
import * as modelMap from './__fixtures__/modelMapping'

const mockFetcher = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
})

test('make hooks; findMany', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ foo: 'bar' }, { foo: 'baz' }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({ rootField: 'findManyUser' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'GET', 'User', modelMap)
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject([{ foo: 'bar' }, { foo: 'baz' }])
  expect(res.error).toBeNull()
})

test('make hooks; findFirst', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ foo: 'bar' }, { foo: 'baz' }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({ rootField: 'findFirstUser' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'GET', 'User', modelMap)
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ foo: 'bar' })
  expect(res.error).toBeNull()
})

test('make hooks; findFirst no records', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({ rootField: 'findFirstUser' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'GET', 'User', modelMap)
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toBeNull()
  expect(res.error).toBeNull()
})

test('make hooks; delete', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({ rootField: 'deleteOneUser' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'DELETE', 'User', modelMap, {
    Prefer: 'return=representation',
  })
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ id: 1 })
  expect(res.error).toBeNull()
})

test('make hooks; deleteMany', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({ rootField: 'deleteManyUser' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'DELETE', 'User', modelMap, {
    Prefer: 'return=representation',
  })
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ count: 2 })
  expect(res.error).toBeNull()
})

test('make hooks; update', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'foo' }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({
      rootField: 'updateOneUser',
      args: { where: { id: 1 }, data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { where: { id: 1 }, data: { name: 'foo' } },
    'PATCH',
    'User',
    modelMap,
    { Prefer: 'return=representation' },
  )
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ id: 1, name: 'foo' })
  expect(res.error).toBeNull()
})

test('make hooks; update - has updatedAt', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'foo' }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({
      rootField: 'updateOneTeam',
      args: { where: { id: 1 }, data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { where: { id: 1 }, data: { name: 'foo', updatedAt: expect.any(Date) } },
    'PATCH',
    'Team',
    modelMap,
    { Prefer: 'return=representation' },
  )
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ id: 1, name: 'foo' })
  expect(res.error).toBeNull()
})

test('make hooks; updateMany', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({
      rootField: 'updateManyUser',
      args: { data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: { name: 'foo' } },
    'PATCH',
    'User',
    modelMap,
    { Prefer: 'return=representation' },
  )
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ count: 2 })
  expect(res.error).toBeNull()
})

test('make hooks; updateMany - has updatedAt', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({
      rootField: 'updateManyTeam',
      args: { data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: { name: 'foo', updatedAt: expect.any(Date) } },
    'PATCH',
    'Team',
    modelMap,
    { Prefer: 'return=representation' },
  )
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ count: 2 })
  expect(res.error).toBeNull()
})

test('make hooks; create', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'foo' }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({
      rootField: 'createOneUser',

      args: { data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: { name: 'foo' } },
    'POST',
    'User',
    modelMap,
    { Prefer: 'return=representation' },
  )
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ id: 1, name: 'foo' })
  expect(res.error).toBeNull()
})

test('make hooks; createMany', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({
      rootField: 'createManyUser',

      args: { data: [{ name: 'foo' }, { name: 'bar' }] },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: [{ name: 'foo' }, { name: 'bar' }] },
    'POST',
    'User',
    modelMap,
    { Prefer: 'return=representation' },
  )
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ count: 2 })
  expect(res.error).toBeNull()
})

test('make hooks; createMany with skipDuplicates', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 2 }]),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({
      rootField: 'createManyUser',
      args: { data: [{ name: 'foo' }, { name: 'bar' }], skipDuplicates: true },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: [{ name: 'foo' }, { name: 'bar' }], skipDuplicates: true },
    'POST',
    'User',
    modelMap,
    { Prefer: 'return=representation,resolution=ignore-duplicates' },
  )
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toMatchObject({ count: 1 })
  expect(res.error).toBeNull()
})

test('make hooks; with error', async () => {
  mockFetcher.mockReturnValue(
    Promise.resolve({
      ok: false,
      json: () =>
        Promise.resolve({
          hint: 'this is hint message',
          message: 'this is error',
        }),
    }),
  )
  const hooks = makeHooks(mockFetcher, modelMap)
  const res = await hooks
    .beforeRequest({ rootField: 'findFirstUser' })
    .catch((res) => res)
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toBeNull()
  expect(res.error).toMatchObject({
    hint: 'this is hint message',
    message: 'this is error',
  })
})
