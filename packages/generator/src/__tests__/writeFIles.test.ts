import { Project, SourceFile } from 'ts-morph'
import {
  writeImports,
  writeOperationMapping,
  writePrepareFunction,
  writeRelationMapping,
  writeTableMapping,
} from '../utils/writeFiles'
import { GeneratorOptions } from '@prisma/generator-helper'
import { getSampleDMMF } from './__fixtures__/getSampleDMMF'

let file: SourceFile

const oldEnv = { ...process.env }

beforeEach(() => {
  const project = new Project()
  file = project.createSourceFile('./dummy.ts')

  process.env = {
    ...oldEnv,
    SUPABASE_URL: 'this is SUPABASE_URL',
    SUPABASE_ANON_KEY: 'this is SUPABASE_ANON_KEY',
    SUPABASE_URL_CUSTOM: 'this is SUPABASE_URL_CUSTOM',
    SUPABASE_ANON_KEY_CUSTOME: 'this is SUPABASE_ANON_KEY_CUSTOME',
  }
})

afterEach(() => {
  process.env = { ...oldEnv }
})

test('writeImports; with no fetchModule', () => {
  writeImports(file, { generator: { config: {} } } as GeneratorOptions)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writeImports; with fetchModule (browser)', () => {
  writeImports(file, {
    generator: { config: { fetchModule: 'browser' } },
  } as unknown as GeneratorOptions)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writeImports; with fetchModule (node-fetch)', () => {
  writeImports(file, {
    generator: { config: { fetchModule: 'node-fetch' } },
  } as unknown as GeneratorOptions)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writeOperationMapping', async () => {
  const options = {
    dmmf: await getSampleDMMF(),
  } as GeneratorOptions

  writeOperationMapping(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writeRelationMapping', async () => {
  const options = {
    dmmf: await getSampleDMMF(),
  } as GeneratorOptions

  writeRelationMapping(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writeTableMapping', async () => {
  const options = {
    dmmf: await getSampleDMMF(),
  } as GeneratorOptions

  writeTableMapping(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writePrepareFunction; with no environments', () => {
  process.env = { ...oldEnv }
  const options = { generator: { config: {} } } as GeneratorOptions
  writePrepareFunction(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writePrepareFunction; with environments', () => {
  const options = { generator: { config: {} } } as GeneratorOptions
  writePrepareFunction(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writePrepareFunction; with environments and specify keys', () => {
  const options = {
    generator: {
      config: {
        endpoint: 'SUPABASE_URL_CUSTOM',
        apikey: 'SUPABASE_URL_CUSTOM',
      },
    },
  } as unknown as GeneratorOptions
  writePrepareFunction(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})
