import * as fs from 'fs'
import { moduleResolve } from './moduleResolve'
import { logger } from '@prisma/sdk'

const { name: generatorName } = require('../../package.json')

const before = 'this.hooks.beforeRequest('
const after = 'await this.hooks.beforeRequest('

export const patching = () => {
  for (const mod of [
    '@prisma/client/runtime/index.js',
    '@prisma/client/runtime/proxy.js',
  ]) {
    const path = moduleResolve(mod)
    if (!path) continue

    const original = fs.readFileSync(path, { encoding: 'utf8' })
    if (original.includes(after)) continue

    // TODO
    if (!original.includes(before)) throw new Error('')

    const patched = original.replace(before, after)
    fs.writeFileSync(path, patched)
    logger.info(`${generatorName}:Patched ${mod}`)
  }
}
