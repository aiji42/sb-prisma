import * as fs from 'fs'
import { moduleResolve } from './moduleResolve'
import { logger } from '@prisma/sdk'

const { name: generatorName } = require('../../package.json')

const patchMappings = [
  {
    module: '@prisma/client/runtime/index.js',
    patches: [
      {
        target: 'this.hooks.beforeRequest(',
        replaceTo: 'await this.hooks.beforeRequest(',
        skipIf: (base: string) =>
          base.includes('await this.hooks.beforeRequest('),
      },
    ],
  },
  {
    module: '@prisma/client/runtime/proxy.js',
    patches: [
      {
        target: 'this.hooks.beforeRequest(',
        replaceTo: 'await this.hooks.beforeRequest(',
        skipIf: (base: string) =>
          base.includes('await this.hooks.beforeRequest('),
      },
      {
        target: 'this.pushSchema()',
        replaceTo: '{}',
        skipIf: (base: string) => !base.includes('this.pushSchema()'),
      },
    ],
  },
]

export const patching = () => {
  patchMappings.forEach(({ module, patches }) => {
    const path = moduleResolve(module)
    if (!path) return
    const original = fs.readFileSync(path, { encoding: 'utf8' })

    patches.forEach(({ skipIf, target, replaceTo }) => {
      if (skipIf(original)) return

      if (!original.includes(target))
        throw new Error(`${generatorName}: The patch failed for ${module}`)

      const patched = original.replace(target, replaceTo)
      fs.writeFileSync(path, patched)
    })

    logger.info(`${generatorName}:Patched ${module}`)
  })
}
