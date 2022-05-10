[![npm version](https://badge.fury.io/js/@sb-prisma%2Fclient.svg)](https://badge.fury.io/js/@sb-prisma%2Fclient)
[![lerna--lite](https://img.shields.io/badge/maintained%20with-lerna--lite-cc00ff)](https://github.com/ghiscoding/lerna-lite)
[![CI](https://github.com/aiji42/sb-prisma/actions/workflows/CI.yml/badge.svg)](https://github.com/aiji42/sb-prisma/actions/workflows/CI.yml)
[![codecov](https://codecov.io/gh/aiji42/sb-prisma/branch/main/graph/badge.svg?token=W7KAYUXF3V)](https://codecov.io/gh/aiji42/sb-prisma)

# sb-prisma

<p align="center">
  <img src="https://github.com/aiji42/sb-prisma/blob/main/hero.png?raw=true" width="450" />
</p>

🔧 This project is experimental and not yet stable, so please use with caution. We look forward to your contributions.

⚠️ For non-node runtimes such as browsers and edge workers. We do not recommend using this library if you have a choice of node.

## About The Project

This is a library that uses REST API of [supabase](https://supabase.com/) directly from the [Prisma](https://www.prisma.io/) client to process databases.  
Prisma is a very useful library, but it cannot be used with non-Node runtimes such as browsers or edge workers; using [Prisma Cloud Data Proxy](https://cloud.prisma.io/) solves this problem, but it does cause delays due to cold starts and round trips.  
Also, if you use [subapabse-js](https://github.com/supabase/supabase-js) without Prisma, you can process the database regardless of runtime, but you will throw away the very good types of Prisma clients.  
This project retains the type benefits of the Prisma client, but allows runtime-independent data access by using subabase's REST API.

## Install & Setup

1. Install `@sb-prisma/client`
```bash
# npm
npm install @sb-prisma/client

# yarn
yarn add @sb-prisma/client
```

2. Add the sb-prisma generator to your schema.prisma
```prisma
generator sb {
  provider = "sb-prisma"
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["dataProxy"] // must specify dataProxy
}
```

3. Run `PRISMA_CLIENT_ENGINE_TYPE=dataproxy npx prisma generate` or `PRISMA_CLIENT_ENGINE_TYPE=dataproxy yarn prisma generate` to generate your initialize code.

This library is based on the Data Proxy client. Therefore, please set the environment variable `PRISMA_CLIENT_ENGINE_TYPE` to `dataproxy`. It is recommended to register it as an alias in the scripts of package.json.
```json
{
  "generate": "PRISMA_CLIENT_ENGINE_TYPE=proxy npx prisma generate"
}
```

## Usage

Simply create the middleware with `makeMiddleware` and set it with `.$use()`. Now, before the prisma client communicates with the DB, it will intercept it and proxy to the REST API of supabase.

```ts
import { PrismaClient } from '@prisma/client'
import { makeMiddleware } from '@sb-prisma/client'

const db = new PrismaClient()
const sbMiddleware = makeMiddleware(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_ANON_KEY ?? '',
)
db.$use(sbMiddleware)

const main = async () => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      Team: true
    },
    where: {
      age: { gte: 20 },
      OR: [
        { email: { startsWith: 'foo', mode: 'insensitive' } },
        { name: { contains: 'bar', mode: 'insensitive' } },
      ]
    },
    take: 10,
    orderBy: { name: 'asc' }
  })
  console.log(users)

  return users
}

main()
```

## Supported APIs

See [APIs.md](https://github.com/aiji42/sb-prisma/blob/main/docs/APIs.md)

## Contribution

Please read [CONTRIBUTING.md](https://github.com/aiji42/sb-prisma/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/aiji42/sb-prisma/blob/main/LICENSE) file for details

---

This generator was bootstraped using [create-prisma-generator](https://github.com/YassinEldeeb/create-prisma-generator)
