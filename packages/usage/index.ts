import { PrismaClient } from '@prisma/client'
import { makeMiddleware } from '@sb-prisma/client'

const middleware = makeMiddleware(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_ANON_KEY ?? '',
)

const db = new PrismaClient()
db.$use(middleware)

const main = async () => {
  await prepare()

  const userFindFirst = await db.user.findFirst()
  console.log('===== db.user.findFirst() =====')
  console.dir(userFindFirst)

  console.log(
    '===== db.user.findMany() with OR condition and ordered desc =====',
  )
  const userFindMany = await db.user.findMany({
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
  })
  console.dir(userFindMany)

  console.log('===== db.team.findMany() with double nested model =====')
  const teamFindMany = await db.team.findMany({
    select: {
      id: false,
      name: true,
      labels: true,
      users: {
        select: {
          name: true,
          Team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: {
          OR: [
            { name: { startsWith: 'f', mode: 'insensitive' } },
            { name: { endsWith: 'z', mode: 'insensitive' } },
          ],
        },
      },
    },
    where: {
      name: { in: ['team1', 'team2'] },
      labels: {
        hasSome: ['ruby', 'javascript'],
      },
    },
  })
  console.dir(teamFindMany)

  console.log('===== db.team.count() =====')
  const teamCount = await db.team.count()
  console.dir(teamCount)

  console.log('===== db.user.count() =====')
  const userCount = await db.user.count({
    select: {
      teamId: true,
      id: true,
      _all: true,
    },
    where: { name: { contains: 'o', mode: 'insensitive' } },
  })
  console.dir(userCount)

  console.log('===== db.user.create() =====')
  const userCreate = await db.user.create({
    data: { name: 'ega', email: 'ega@example.com' },
  })
  console.dir(userCreate)

  console.log('===== db.user.createMany() with skipDuplicates =====')
  const userCreateMany = await db.user.createMany({
    data: [
      {
        id: userFindFirst!.id,
        name: userFindFirst!.name,
        email: userFindFirst!.email,
        teamId: userFindFirst!.teamId,
      },
    ],
    skipDuplicates: true,
  })
  console.dir(userCreateMany)

  console.log('===== db.user.update() =====')
  const userUpdate = await db.user.update({
    data: { name: 'hoo' },
    where: { id: userFindFirst!.id },
  })
  console.dir(userUpdate)

  console.log('===== db.user.updateMany() =====')
  const userUpdateMany = await db.user.updateMany({
    data: { name: 'hee' },
  })
  console.dir(userUpdateMany)

  console.log('===== db.user.delete() =====')
  const userDelete = await db.user.delete({ where: { id: userFindFirst!.id } })
  console.dir(userDelete)

  console.log('===== db.team.deleteMany() =====')
  const userDeleteMany = await db.team.deleteMany({
    where: { name: { contains: 'team' } },
  })
  console.dir(userDeleteMany)

  return {
    userFindFirst,
    userFindMany,
    teamFindMany,
    teamCount,
    userCount,
    userCreate,
    userCreateMany,
    userUpdate,
    userUpdateMany,
    userDelete,
    userDeleteMany,
  }
}

const handleRequest = async () => {
  const body = await main()

  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'text/json' },
  })
}

addEventListener(
  'fetch',
  (event: { respondWith: (arg0: Promise<Response>) => void }) => {
    event.respondWith(handleRequest())
  },
)

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
      { name: 'Org', email: 'org@example.com', teamId: null },
    ],
  })
}

const cleanUp = async () => {
  await Promise.all([db.user.deleteMany(), db.team.deleteMany()])
  console.log('complete cleanup 🧹')
}
