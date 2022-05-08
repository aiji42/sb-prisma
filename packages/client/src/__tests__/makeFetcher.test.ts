import { makeFetcher } from '../helpers/makeFetcher'
import * as modelMap from './__fixtures__/modelMapping'

const fetchMock = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
})

test('make fetcher', () => {
  const fetcher = makeFetcher(
    'https://example.supabase.co',
    'exampletoken',
    fetchMock,
  )
  fetcher(
    {
      select: { id: true, name: true },
      where: { id: { gt: 10 } },
      take: 10,
      skip: 20,
    },
    'GET',
    'User',
    modelMap,
    { Additional: 'Additional header' },
  )

  expect(fetchMock).toBeCalledWith(
    'https://example.supabase.co/rest/v1/User?select=id%2Cname&and=%28id.gt.10%29&limit=10&offset=20',
    {
      method: 'GET',
      headers: {
        apikey: 'exampletoken',
        Authorization: 'Bearer exampletoken',
        Additional: 'Additional header',
        'Content-Type': 'application/json',
      },
    },
  )
})

test('make fetcher; with related model filter', () => {
  const fetcher = makeFetcher(
    'https://example.supabase.co',
    'exampletoken',
    fetchMock,
  )
  fetcher(
    {
      select: {
        id: true,
        name: true,
        users: {
          select: {
            id: true,
            name: true,
          },
          where: {
            name: { startsWith: 'foo', mode: 'insensitive' },
            id: { gte: 10 },
          },
          skip: 10,
          take: 20,
        },
      },
      where: { id: { gt: 10 } },
      take: 10,
      skip: 20,
    },
    'GET',
    'Team',
    modelMap,
    { Additional: 'Additional header' },
  )

  expect(fetchMock).toBeCalledWith(
    'https://example.supabase.co/rest/v1/_team?select=id%2Cname%2Cusers%3AUser%28id%2Cname%29&and=%28id.gt.10%29&limit=10&offset=20&users.and=%28name.ilike.foo*%2Cid.gte.10%29&users.limit=20&users.offset=10',
    {
      method: 'GET',
      headers: {
        apikey: 'exampletoken',
        Authorization: 'Bearer exampletoken',
        Additional: 'Additional header',
        'Content-Type': 'application/json',
      },
    },
  )
})

test('make fetcher with data and POST/PATCH method', () => {
  const fetcher = makeFetcher(
    'https://example.supabase.co',
    'exampletoken',
    fetchMock,
  )
  fetcher(
    {
      where: { id: { gt: 10 } },
      data: { name: 'foo' },
    },
    'POST',
    'Team',
    modelMap,
    { Additional: 'Additional header' },
  )

  expect(fetchMock).toBeCalledWith(
    'https://example.supabase.co/rest/v1/_team?select=*&and=%28id.gt.10%29',
    {
      method: 'POST',
      headers: {
        apikey: 'exampletoken',
        Authorization: 'Bearer exampletoken',
        Additional: 'Additional header',
        'Content-Type': 'application/json',
      },
      body: '{"name":"foo"}',
    },
  )
})
