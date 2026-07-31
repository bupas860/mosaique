import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateUnderstandV2 } from './validate-understand-v2.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUTPUT = path.join(ROOT, 'src/data/generated-v2/understand')
const json = (value) => `${JSON.stringify(value, null, 2)}\n`

export async function importUnderstandV2() {
  const parsed = await validateUnderstandV2()
  const temporary = `${OUTPUT}.tmp-${process.pid}`
  await rm(temporary, { recursive: true, force: true }); await mkdir(path.join(temporary, 'modules'), { recursive: true })
  const files = [['manifest.json', parsed.manifest], ['index.json', parsed.index], ['glossary.json', parsed.glossary], ['bibliography.json', parsed.bibliography], ['links.json', parsed.links], ...parsed.modules.map((module) => [`modules/${module.id.toLowerCase()}.json`, module])]
  await Promise.all(files.map(([filename, value]) => writeFile(path.join(temporary, filename), json(value), 'utf8')))
  const previous = `${OUTPUT}.previous-${process.pid}`
  await rm(previous, { recursive: true, force: true })
  try { await rename(OUTPUT, previous) } catch (error) { if (error.code !== 'ENOENT') throw error }
  try { await rename(temporary, OUTPUT); await rm(previous, { recursive: true, force: true }) } catch (error) { try { await rename(previous, OUTPUT) } catch {} throw error }
  console.log(`Comprendre généré : ${files.length} fichiers déterministes.`)
}

if (process.argv[1] === new URL(import.meta.url).pathname) importUnderstandV2().catch((error) => { console.error(error.message); process.exitCode = 1 })
