import { makeHooks } from '../helpers/hooks'
import SupabaseResponse from '../response/SupabaseResponse'

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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({ clientMethod: 'user.findMany' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'GET', 'User', { user: 'User' })
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({ clientMethod: 'user.findFirst' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'GET', 'User', { user: 'User' })
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({ clientMethod: 'user.findFirst' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith({}, 'GET', 'User', { user: 'User' })
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({ clientMethod: 'user.delete' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    {},
    'DELETE',
    'User',
    { user: 'User' },
    { Prefer: 'return=representation' },
  )
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({ clientMethod: 'user.deleteMany' })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    {},
    'DELETE',
    'User',
    { user: 'User' },
    { Prefer: 'return=representation' },
  )
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({
      clientMethod: 'user.update',
      args: { where: { id: 1 }, data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { where: { id: 1 }, data: { name: 'foo' } },
    'PATCH',
    'User',
    { user: 'User' },
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({
      clientMethod: 'user.updateMany',
      args: { data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: { name: 'foo' } },
    'PATCH',
    'User',
    { user: 'User' },
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({
      clientMethod: 'user.create',
      args: { data: { name: 'foo' } },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: { name: 'foo' } },
    'POST',
    'User',
    { user: 'User' },
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({
      clientMethod: 'user.createMany',
      args: { data: [{ name: 'foo' }, { name: 'bar' }] },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: [{ name: 'foo' }, { name: 'bar' }] },
    'POST',
    'User',
    { user: 'User' },
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({
      clientMethod: 'user.createMany',
      args: { data: [{ name: 'foo' }, { name: 'bar' }], skipDuplicates: true },
    })
    .catch((res) => res)

  expect(mockFetcher).toBeCalledWith(
    { data: [{ name: 'foo' }, { name: 'bar' }], skipDuplicates: true },
    'POST',
    'User',
    { user: 'User' },
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
  const hooks = makeHooks(mockFetcher, { user: 'User' })
  const res = await hooks
    .beforeRequest({ clientMethod: 'user.findFirst' })
    .catch((res) => res)
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toBeNull()
  expect(res.error).toMatchObject({
    hint: 'this is hint message',
    message: 'this is error',
  })
})
