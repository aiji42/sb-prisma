import { makeSelect } from '../helpers/makeSelect'
import * as modelMap from './__fixtures__/modelMapping'

test('make select statement', () => {
  expect(makeSelect({}, 'User', modelMap)).toEqual('*')
})

test('make select statement with related table', () => {
  const arg = {
    select: {
      id: true,
      name: true,
      Team: true,
    },
  }
  expect(makeSelect(arg, 'User', modelMap)).toEqual('id,name,Team:_team(*)')
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
  expect(makeSelect(arg, 'Team', modelMap)).toEqual(
    'id,name,users:User(id,name,Team:_team(id,name,users:User(*)))',
  )
})
