import { generatorHandler } from '@prisma/generator-helper'
import { logger } from '@prisma/sdk'
import { Project } from 'ts-morph'
import {
  writeImports,
  writeOperationMapping,
  writePrepareFunction,
  writeRelationMapping,
  writeTableMapping,
} from './utils/writeFiles'
import { formatFile } from './utils/formatFile'

const { version, name: generatorName } = require('../package.json')

generatorHandler({
  onManifest() {
    logger.info(`${generatorName}:Registered`)
    return {
      version,
      defaultOutput: '../prisma-sb',
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

    writeImports(indexFile, options)
    writeOperationMapping(indexFile, options)
    writeRelationMapping(indexFile, options)
    writeTableMapping(indexFile, options)
    writePrepareFunction(indexFile, options)

    indexFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
    })

    await project.save()
    await formatFile(indexFile.getFilePath())
  },
})
