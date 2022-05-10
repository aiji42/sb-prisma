import { makeSelect } from '../helpers/makeSelect'
import { DataModel } from '../libs/DataModel'
import { getSampleDMMF } from './__fixtures__/getSampleSchema'

test('make select statement', async () => {
  const doc = new DataModel((await getSampleDMMF()).datamodel)
  expect(makeSelect({}, 'User', doc)).toEqual('*')
})

test('make select statement with related table', async () => {
  const doc = new DataModel((await getSampleDMMF()).datamodel)
  const arg = {
    select: {
      id: true,
      name: true,
      Team: true,
    },
  }
  expect(makeSelect(arg, 'User', doc)).toEqual('id,name,Team:teams(*)')
})

test('make select statement with alias', async () => {
  const doc = new DataModel((await getSampleDMMF()).datamodel)
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
  expect(makeSelect(arg, 'Team', doc)).toEqual(
    'id,name,users:User(id,name,Team:teams(id,name,users:User(*)))',
  )
})
