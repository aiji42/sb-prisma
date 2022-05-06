import prettier from 'prettier'
import { writeFileSync, readFileSync } from 'node:fs'

export const formatFile = async (path: string): Promise<void> => {
  const options = await prettier.resolveConfig(process.cwd())
  if (!options) return
  const content = readFileSync(path)
  const formatted = prettier.format(content.toString(), {
    ...options,
    parser: 'typescript',
  })
  return writeFileSync(path, formatted)
}
