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
  await prepare()
  const team = await db.team.findMany({
    select: {
      id: false,
      name: true,
      labels: true,
    },
    where: {
      labels: {
        isEmpty: true,
      },
    },
  })
  console.log(team)

  await cleanUp()
}

const prepare = async () => {
  await cleanUp()
  await db.team.createMany({
    data: [
      { name: 'team1', labels: ['python', 'ruby'] },
      { name: 'team2', labels: ['typescript', 'javascript'] },
      { name: 'team3', labels: [] },
    ],
  })
  const teams = await db.team.findMany()
  await db.user.createMany({
    data: [
      { name: 'Foo', email: 'foo@example.com', teamId: teams[0].id },
      { name: 'Bar', email: 'bar@example.com', teamId: teams[0].id },
      { name: 'Baz', email: 'baz@example.com', teamId: teams[1].id },
    ],
  })
}

const cleanUp = async () => {
  await Promise.all([db.user.deleteMany(), db.team.deleteMany()])
  console.log('complete cleanup 🧹')
}

main()
