import { generatorHandler } from '@prisma/generator-helper'
import { logger } from '@prisma/sdk'
import { Project } from 'ts-morph'
import {
  writeImportsAndExports,
  writeModels,
  writeOperationMapping,
  writePrepareFunction,
} from './utils/writeFiles'
import { formatFile } from './utils/formatFile'
import { patching } from './utils/patching'

const { version, name: generatorName } = require('../package.json')

generatorHandler({
  onManifest() {
    logger.info(`${generatorName}:Registered`)
    return {
      version,
      defaultOutput: '../sb-prisma',
      prettyName: generatorName,
    }
  },
  onGenerate: async (options) => {
    const project = new Project()
    const outputPath = options.generator.output?.value ?? ''

    const indexFile = project.createSourceFile(
      `${outputPath}/index.ts`,
      {},
      { overwrite: true },
    )

    writeImportsAndExports(indexFile, options)
    writeOperationMapping(indexFile, options)
    writeModels(indexFile, options)
    writePrepareFunction(indexFile, options)

    indexFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
    })

    await project.save()
    await formatFile(indexFile.getFilePath())

    patching()
  },
})
