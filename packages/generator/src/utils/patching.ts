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
      },
    ],
  },
  {
    module: '@prisma/client/runtime/proxy.js',
    patches: [
      {
        target: 'this.hooks.beforeRequest(',
        replaceTo: 'await this.hooks.beforeRequest(',
      },
      {
        target: 'this.pushSchema()',
        replaceTo: '{}',
      },
      {
        target: 'this.extractHostAndApiKey()',
        replaceTo: '["",""]',
      },
    ],
  },
]

export const patching = () => {
  patchMappings.forEach(({ module, patches }) => {
    const path = moduleResolve(module)
    if (!path) return
    let content = fs.readFileSync(path, { encoding: 'utf8' })

    patches.forEach(({ target, replaceTo }) => {
      content = content.replace(target, replaceTo)
    })
    fs.writeFileSync(path, content)

    logger.info(`${generatorName}:Patched ${module}`)
  })
}
