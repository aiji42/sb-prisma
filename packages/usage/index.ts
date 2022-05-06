import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { createClient, sb } from '@sb-prisma/client'
import './sb-prisma'

const prisma = createClient<PrismaClient>(PrismaClient)
// const db = new PrismaClient()

const main = async () => {
  await prepare()

  const user = await sb(prisma.user.findFirst())
  console.log('===== prisma.user.findFirst() =====')
  console.dir(user)

  console.log(
    '===== prisma.user.findMany() with OR condition and ordered desc =====',
  )
  console.dir(
    await sb(
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          Team: {
            select: {
              name: true,
            },
          },
        },
        where: {
          OR: [
            {
              name: { contains: 'oo', mode: 'insensitive' },
            },
            {
              name: { contains: 'az', mode: 'insensitive' },
            },
          ],
        },
        orderBy: { id: 'desc' },
      }),
    ),
  )

  console.log('===== prisma.team.findMany() with double nested model =====')
  console.dir(
    await sb(
      prisma.team.findMany({
        select: {
          id: true,
          name: false,
          users: {
            select: {
              Team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        where: {
          name: { in: ['team2', 'team3'] },
        },
      }),
    ),
    { depth: 4 },
  )

  console.log('===== prisma.user.create() =====')
  console.dir(
    await sb(
      prisma.user.create({
        data: { name: 'ega', email: 'ega@example.com' },
      }),
    ),
  )

  console.log('===== prisma.user.createMany() with skipDuplicates =====')
  user &&
    console.dir(
      await sb(
        prisma.user.createMany({
          data: [user],
          skipDuplicates: true,
        }),
      ),
    )

  console.log('===== prisma.user.update() =====')
  user &&
    console.dir(
      await sb(
        prisma.user.update({
          data: { name: 'hoo' },
          where: { id: user.id },
        }),
      ),
    )

  console.log('===== prisma.user.updateMany() =====')
  console.dir(
    await sb(
      prisma.user.updateMany({
        data: { name: 'hee' },
      }),
    ),
  )

  console.log('===== prisma.user.delete() =====')
  user && console.dir(await sb(prisma.user.delete({ where: { id: user.id } })))

  console.log('===== prisma.team.deleteMany() =====')
  console.dir(
    await sb(
      prisma.team.deleteMany({
        where: { name: { contains: 'team' } },
      }),
    ),
  )
}

const prepare = async () => {
  await cleanUp()
  await sb(
    prisma.team.createMany({
      data: [{ name: 'team1' }, { name: 'team2' }, { name: 'team3' }],
    }),
  )
  const teams = await sb(prisma.team.findMany())
  await sb(
    prisma.user.createMany({
      data: [
        { name: 'Foo', email: 'foo@example.com', teamId: teams[0].id },
        { name: 'Bar', email: 'bar@example.com', teamId: teams[0].id },
        { name: 'Baz', email: 'baz@example.com', teamId: teams[1].id },
      ],
    }),
  )
}

const cleanUp = async () => {
  await Promise.all([
    sb(prisma.user.deleteMany()),
    sb(prisma.team.deleteMany()),
  ])
  console.log('complete cleanup 🧹')
}

main()
  .catch(console.log)
  .finally(() => cleanUp())
