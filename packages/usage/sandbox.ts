import { PrismaClient } from '@prisma/client'

const db = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

db.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

const main = async () => {
  const team = await db.team.updateMany({
    data: {
      name: 'team4',
    },
  })
  console.log(team)
  console.log(await db.team.findFirst())

  // const a = await db.team.findMany({
  //   where: {
  //     users: {
  //       none: { name: { equals: 'aaaa' } },
  //     },
  //   },
  // })
  // console.log(a)
}

main()
