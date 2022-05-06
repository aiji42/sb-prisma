import { makeOrder } from '../helpers/makeOrder'

test('make order statement with single', () => {
  expect(makeOrder({ orderBy: { id: 'asc' } })).toEqual('id.asc')
})

test('make order statement with multi', () => {
  expect(makeOrder({ orderBy: [{ id: 'asc' }, { name: 'desc' }] })).toEqual(
    'id.asc,name.desc',
  )
})
