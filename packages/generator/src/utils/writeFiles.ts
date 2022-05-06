import { SourceFile, VariableDeclarationKind } from 'ts-morph'
import { GeneratorOptions } from '@prisma/generator-helper'

export const writeImports = (file: SourceFile, options: GeneratorOptions) => {
  if (options.generator.config.fetchModule !== 'browser')
    file.addImportDeclaration({
      defaultImport: 'fetch',
      moduleSpecifier: options.generator.config.fetchModule ?? '',
    })
  file.addImportDeclaration({
    namedImports: ['prepare'],
    moduleSpecifier: '@prisma-sb/client',
  })
}

export const writeOperationMapping = (
  file: SourceFile,
  options: GeneratorOptions,
) => {
  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'operationMapping',
        initializer: (writer) => {
          writer.block(() => {
            options.dmmf.mappings.modelOperations.forEach(
              ({ model, ...rest }) => {
                Object.entries(rest).forEach(([method, func]) => {
                  writer.write(`${func}: `)
                  writer.inlineBlock(() => {
                    writer.write('model: ').quote(model).write(',')
                    writer.write('method: ').quote(method)
                  })
                  writer.write(',')
                })
              },
            )
          })
        },
      },
    ],
  })
}

export const writeRelationMapping = (
  file: SourceFile,
  options: GeneratorOptions,
) => {
  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'relationMapping',
        initializer: (writer) => {
          writer.block(() => {
            options.dmmf.datamodel.models.forEach(({ name, fields }) => {
              writer.write(`${name}: `)
              writer.inlineBlock(() => {
                fields.forEach(({ kind, name, type }) => {
                  if (kind === 'object')
                    writer.write(`${name}: "${type}"`).write(',')
                })
              })
              writer.write(',')
            })
          })
        },
      },
    ],
  })
}

export const writeTableMapping = (
  file: SourceFile,
  options: GeneratorOptions,
) => {
  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'tableMapping',
        initializer: (writer) => {
          writer.block(() => {
            options.dmmf.datamodel.models.forEach(({ name, dbName }) => {
              writer
                .write(`${name}: `)
                .quote(dbName ?? name)
                .write(',')
            })
          })
        },
      },
    ],
  })
}

const ENDPOINT = 'SUPABASE_URL'
const API_KEY = 'SUPABASE_ANON_KEY'

export const writePrepareFunction = (
  file: SourceFile,
  options: GeneratorOptions,
) => {
  const { endpoint, apikey } = options.generator.config
  file.addStatements((writer) => {
    writer.write('prepare(')
    writer
      .inlineBlock(() => {
        writer
          .write('endpoint: ')
          .write(`process.env.${ENDPOINT}`)
          .conditionalWrite(
            !!endpoint && endpoint !== ENDPOINT,
            ` || process.env.${endpoint}`,
          )
          .write(` || "${process.env[endpoint ?? ENDPOINT] ?? ''}"`)
          .write(',')
        writer
          .write('apikey: ')
          .write(`process.env.${API_KEY}`)
          .conditionalWrite(
            !!apikey && apikey !== API_KEY,
            ` || process.env.${apikey}`,
          )
          .write(` || "${process.env[apikey ?? API_KEY] ?? ''}"`)
          .write(',')
          .newLine()
        writer.write('//@ts-ignore').newLine()
        writer.write('fetch').write(',')
        writer
          .write('modelMap: ')
          .inlineBlock(() => {
            writer.write('operationMapping,')
            writer.write('relationMapping,')
            writer.write('tableMapping,')
          })
          .write(',')
      })
      .write(')')
  })
}
