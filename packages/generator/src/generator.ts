import { generatorHandler } from '@prisma/generator-helper'
import { patching } from './utils/patching'

const { version, name: generatorName } = require('../package.json')

generatorHandler({
  onManifest() {
    return {
      version,
      defaultOutput: './sb-prisma',
      prettyName: generatorName,
    }
  },
  onGenerate: async () => {
    patching()
  },
})
