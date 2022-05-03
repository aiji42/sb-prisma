import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const main = async () => {
  await db.team.createMany({
    data: [{ name: 'team1' }, { name: 'team2' }],
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

main().catch(console.error)
