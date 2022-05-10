import { getConfig, getDMMF, getSchemaSync } from '@prisma/sdk'
import { GeneratorConfig } from '@prisma/generator-helper'
import * as path from 'path'

const samplePrismaSchema = getSchemaSync(
  path.join(__dirname, './sample.prisma'),
)

export const getSampleDMMF = async () => {
  return getDMMF({
    datamodel: samplePrismaSchema,
  })
}

export const getSampleGenerator = async (
  n: string,
): Promise<GeneratorConfig> => {
  const { generators } = await getConfig({
    datamodel: samplePrismaSchema,
  })
  return generators.find(({ name }) => name === n)!
}
