# @sb-prisma/client

🔧 This project is experimental and not yet stable, so please use with caution. We look forward to your contributions.

⚠️ For non-node runtimes such as browsers and edge workers. We do not recommend using this library if you have a choice of node.

## About The Project

This is a library that uses REST API of [supabase](https://supabase.com/) directly from the [Prisma](https://www.prisma.io/) client to process databases.  
Prisma is a very useful library, but it cannot be used with non-Node runtimes such as browsers or edge workers; using [Prisma Cloud Data Proxy](https://cloud.prisma.io/) solves this problem, but it does cause delays due to cold starts and round trips.  
Also, if you use [subapabse-js](https://github.com/supabase/supabase-js) without Prisma, you can process the database regardless of runtime, but you will throw away the very good types of Prisma clients.  
This project retains the type benefits of the Prisma client, but allows runtime-independent data access by using subabase's REST API.

**See [sb-prisma](https://github.com/aiji42/sb-prisma)**