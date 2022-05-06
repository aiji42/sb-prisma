import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { createClient, sb } from '@prisma-sb/client'
import './prisma-sb'

const prisma = createClient<PrismaClient>(PrismaClient)
const db = new PrismaClient()

const main = async () => {
  const user = await sb(prisma.user.findFirst())
  console.dir(user)

  const users = await sb(
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
            name: { contains: 'ar', mode: 'insensitive' },
          },
          {
            name: { contains: 'az', mode: 'insensitive' },
          },
        ],
      },
      orderBy: { id: 'desc' },
    }),
  )
  console.dir(users, { depth: 5 })

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
          name: { in: ['team1', 'team2'] },
          id: { gte: 1 },
        },
      }),
    ),
    { depth: 5 },
  )

  console.dir(
    await sb(
      prisma.user.create({
        data: { name: 'ega', email: 'ewrbrwa@grag.com' },
      }),
    ),
    { depth: 5 },
  )

  user &&
    console.dir(
      await sb(
        prisma.user.createMany({
          data: [user],
          skipDuplicates: true,
        }),
      ),
      { depth: 5 },
    )

  user &&
    console.dir(
      await sb(
        prisma.user.update({
          data: { name: 'hoo' },
          where: { id: user.id },
        }),
      ),
      { depth: 5 },
    )

  console.dir(
    await sb(
      prisma.user.updateMany({
        data: { name: 'hoo' },
      }),
    ),
    { depth: 5 },
  )

  user &&
    console.dir(await sb(prisma.user.delete({ where: { id: user.id } })), {
      depth: 5,
    })

  const deletedUsers = await sb(
    prisma.team.deleteMany({
      where: { name: { contains: 'team' } },
    }),
  )
  console.dir(deletedUsers, { depth: 5 })
}

main().catch(console.log)
