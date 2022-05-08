import { Project, SourceFile } from 'ts-morph'
import {
  writeImportsAndExports,
  writeOperationMapping,
  writePrepareFunction,
  writeRelationMapping,
  writeTableMapping,
} from '../utils/writeFiles'
import { GeneratorOptions } from '@prisma/generator-helper'
import {
  getSampleGenerator,
  getSampleDMMF,
} from './__fixtures__/getSampleSchema'

let file: SourceFile

const oldEnv = { ...process.env }

beforeEach(() => {
  const project = new Project()
  file = project.createSourceFile('./dummy.ts')

  process.env = {
    ...oldEnv,
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
  }
})

afterEach(() => {
  process.env = { ...oldEnv }
})

test('writeImportsAndExports; with no fetchModule', async () => {
  const options = {
    generator: await getSampleGenerator('generator_minimum'),
  } as GeneratorOptions
  writeImportsAndExports(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writeImportsAndExports; with fetchModule (browser)', async () => {
  const options = {
    generator: await getSampleGenerator('generator_with_browser_fetch'),
  } as GeneratorOptions
  writeImportsAndExports(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writeImportsAndExports; with fetchModule (node-fetch)', async () => {
  const options = {
    generator: await getSampleGenerator('generator_with_node_fetch'),
  } as GeneratorOptions
  writeImportsAndExports(file, options)
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

test('writePrepareFunction; not specify keys', async () => {
  const options = {
    generator: await getSampleGenerator('generator_minimum'),
  } as GeneratorOptions
  writePrepareFunction(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})

test('writePrepareFunction; specify keys', async () => {
  const options = {
    generator: await getSampleGenerator('generator_with_sb_envs'),
  } as GeneratorOptions
  writePrepareFunction(file, options)
  expect(file.getFullText()).toMatchSnapshot()
})
