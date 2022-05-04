import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { makeFetcher } from 'prisma-generator-supabase/dist/helpers/makeFetcher'
import fetch from 'node-fetch'

const fetcher = makeFetcher(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_ANON_KEY ?? '',
  // @ts-ignore
  fetch,
)

const prisma = new PrismaClient({
  // @ts-ignore
  __internal: {
    hooks: {
      beforeRequest: async ({
        args = {},
        typeName,
      }: {
        args?: any
        typeName: string
      }) => {
        const res = await fetcher(args, typeName, modelMapper)
        throw await res.json()
      },
    },
  },
})

const modelMapper: Record<string, string> = {
  'User.Team': 'Team',
  'Team.users': 'User',
}

const main = async () => {
  console.dir(
    await prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          Team: {
            select: {
              users: true,
            },
          },
        },
        take: 3,
        skip: 0,
        orderBy: { id: 'desc' },
        where: {
          id: { notIn: [2] },
        },
      })
      .catch((data) => data),
    { depth: 5 },
  )

  console.dir(
    await prisma.team
      .findMany({
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
      })
      .catch((data) => data),
    { depth: 5 },
  )
}

main().catch(console.log)
