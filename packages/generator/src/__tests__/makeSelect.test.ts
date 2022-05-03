import { makeSelect } from '../helpers/makeSelect'

const modelMapper: Record<string, string> = {
  'User.Team': 'Team',
  'Team.users': 'User',
}

test('make select statement', () => {
  expect(makeSelect({}, 'User', modelMapper)).toEqual('*')
})

test('make select statement with related table', () => {
  const arg = {
    select: {
      id: true,
      name: true,
      Team: true,
    },
  }
  expect(makeSelect(arg, 'User', modelMapper)).toEqual('id,name,Team:Team(*)')
})

test('make select statement with alias', () => {
  const arg = {
    select: {
      id: true,
      name: true,
      users: {
        select: {
          id: true,
          name: true,
          Team: {
            select: {
              id: true,
              name: true,
              users: true,
            },
          },
        },
      },
    },
  }
  expect(makeSelect(arg, 'Team', modelMapper)).toEqual(
    'id,name,users:User(id,name,Team:Team(id,name,users:User(*)))',
  )
})
