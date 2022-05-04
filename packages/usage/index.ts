import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import {
  createClient,
  prepare,
  sb,
} from 'prisma-generator-supabase/dist/client'
import fetch from 'node-fetch'

const modelMapper: Record<string, string> = {
  'User.Team': 'Team',
  'Team.users': 'User',
}

prepare({
  endpoint: process.env.SUPABASE_URL ?? '',
  apikey: process.env.SUPABASE_ANON_KEY ?? '',
  // @ts-ignore
  fetch: (url, init) => {
    console.log(url)
    // @ts-ignore
    return fetch(url, init)
  },
  modelMap: modelMapper,
})

const prisma = createClient<PrismaClient>(PrismaClient)

const main = async () => {
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
            name: { contains: 'foo', mode: 'insensitive' },
          },
          {
            name: { contains: 'bar', mode: 'insensitive' },
          },
          {
            name: { contains: 'baz', mode: 'insensitive' },
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
}

main().catch(console.log)
