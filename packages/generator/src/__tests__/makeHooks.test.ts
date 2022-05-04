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
  const hooks = makeHooks(mockFetcher, {})
  const res = await hooks
    .beforeRequest({ isList: true, typeName: 'User' })
    .catch((res) => res)
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
  const hooks = makeHooks(mockFetcher, {})
  const res = await hooks
    .beforeRequest({ isList: false, typeName: 'User' })
    .catch((res) => res)
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
  const hooks = makeHooks(mockFetcher, {})
  const res = await hooks
    .beforeRequest({ isList: false, typeName: 'User' })
    .catch((res) => res)
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toBeNull()
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
  const hooks = makeHooks(mockFetcher, {})
  const res = await hooks
    .beforeRequest({ isList: true, typeName: 'User' })
    .catch((res) => res)
  expect(res).toBeInstanceOf(SupabaseResponse)
  expect(res.data).toBeNull()
  expect(res.error).toMatchObject({
    hint: 'this is hint message',
    message: 'this is error',
  })
})
