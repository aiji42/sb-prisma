import { SourceFile, VariableDeclarationKind } from 'ts-morph'
import { DMMF, GeneratorOptions } from '@prisma/generator-helper'

export const writeImportsAndExports = (
  file: SourceFile,
  options: GeneratorOptions,
) => {
  const { fetchModule = 'browser' } = options.generator.config
  if (fetchModule !== 'browser')
    file.addImportDeclaration({
      defaultImport: 'fetch',
      moduleSpecifier: fetchModule ?? '',
    })
  file.addImportDeclaration({
    namedImports: ['prepare'],
    moduleSpecifier: '@sb-prisma/client',
  })
  file.addExportDeclaration({
    namedExports: ['createClient', 'sb'],
    moduleSpecifier: '@sb-prisma/client',
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

export const writeModels = (file: SourceFile, options: GeneratorOptions) => {
  const models = Object.fromEntries(
    options.dmmf.datamodel.models.map(({ fields, ...model }) => {
      model.fields = Object.fromEntries<Record<string, DMMF.Field>>(
        fields.map((field) => [field.name, field]),
      )
      return [
        model.name,
        {
          ...model,
          fields: Object.fromEntries(
            fields.map((field) => [field.name, field]),
          ),
        },
      ]
    }),
  )

  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'models',
        initializer: (writer) => {
          writer.write(JSON.stringify(models))
        },
      },
    ],
  })
}

const ENDPOINT = 'SUPABASE_URL'
const API_KEY = 'SUPABASE_API_KEY'

export const writePrepareFunction = (
  file: SourceFile,
  options: GeneratorOptions,
) => {
  const { endpoint = ENDPOINT, apikey = API_KEY } = options.generator.config
  file.addStatements((writer) => {
    writer.write('prepare(')
    writer
      .inlineBlock(() => {
        writer.write('endpoint: ').write(`process.env.${endpoint}`).write(',')
        writer.write('apikey: ').write(`process.env.${apikey}`).write(',')
        writer.writeLine('//@ts-ignore')
        writer.write('fetch').write(',')
        writer
          .write('modelMap: ')
          .inlineBlock(() => {
            writer.write('operationMapping,')
            writer.write('models,')
          })
          .write(',')
      })
      .write(')')
  })
}
