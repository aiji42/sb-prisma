import { RequestBuilder } from '../libs/RequestBuilder'
// @ts-ignore
import { Prisma } from '@prisma/client'

export const makeMiddleware = (endpoint: string, apikey: string) => {
  const builder = new RequestBuilder(Prisma.dmmf.datamodel, endpoint, apikey)

  // @ts-ignore
  const middleware: Prisma.Middleware = async ({ args, action, model }) => {
    return await builder.execute(args ?? {}, model ?? '', action)
  }
  return middleware
}
