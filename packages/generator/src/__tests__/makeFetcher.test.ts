import { makeFetcher } from '../helpers/makeFetcher'

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
    {},
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
      },
    },
  )
})
