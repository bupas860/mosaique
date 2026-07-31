import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MODULE_IDS } from './parse-understand-v2.mjs'
import { validateUnderstandV2 } from './validate-understand-v2.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUTPUT = path.join(ROOT, 'src/data/generated-v2/understand')
const forbidden = [/Dossier_de_recherche/i, /Audit_et_Architecture/i, /Audit_harmonisation/i, /Gabarit_editorial/i, /\bDR\d{3}\b/, /\bS(?:16[5-9]|17[0-4])\b/, /\.(?:pdf|docx?|md)\s*\(1\)/i, /Volet réservé au formateur/i, /Données opératoires/i, /Données contextuelles/i, /Informations confidentielles dans l’univers du personnage/i, /Conflits potentiels avec la matrice/i, /\/home\//, /dangerouslySetInnerHTML/i, /javascript:/i, /data:/i, /<script/i, /"type"\s*:\s*"raw"/]
const hash = (value) => createHash('sha256').update(value).digest('hex')

export async function checkUnderstandPublicV2() {
  const expected = await validateUnderstandV2()
  const names = (await readdir(path.join(OUTPUT, 'modules'))).sort()
  if (names.join(',') !== MODULE_IDS.map((id) => `${id.toLowerCase()}.json`).join(',')) throw new Error('Fichiers modules générés invalides')
  const readJson = async (filename) => JSON.parse(await readFile(path.join(OUTPUT, filename), 'utf8'))
  const actual = { manifest: await readJson('manifest.json'), index: await readJson('index.json'), glossary: await readJson('glossary.json'), bibliography: await readJson('bibliography.json'), links: await readJson('links.json'), modules: await Promise.all(names.map((name) => readJson(`modules/${name}`))) }
  if (actual.modules.length !== 12 || actual.index.modules.length !== 12 || actual.glossary.entries.length !== 68 || actual.bibliography.entries.length !== 164 || actual.links.situations.length !== 24) throw new Error('Cardinalités publiques invalides')
  if (actual.modules.map(({ id }) => id).join(',') !== MODULE_IDS.join(',')) throw new Error('Ordre public invalide')
  if (new Set(actual.modules.map(({ id }) => id)).size !== 12) throw new Error('Identifiant module dupliqué')
  const publicIds = actual.bibliography.entries.map(({ id }) => id); if (publicIds[0] !== 'S001' || publicIds.at(-1) !== 'S164' || publicIds.some((id, index) => id !== `S${String(index + 1).padStart(3, '0')}`)) throw new Error('Plage bibliographique publique invalide')
  const glossaryIds = new Set(actual.glossary.entries.map(({ id }) => id)); const situationIds = new Set(actual.links.situations.map(({ code }) => code))
  for (const module of actual.modules) { for (const id of module.related.modules) if (!MODULE_IDS.includes(id)) throw new Error(`Module lié inconnu : ${id}`); for (const id of module.related.notions) if (!glossaryIds.has(id)) throw new Error(`Notion liée inconnue : ${id}`); for (const id of module.related.situations) if (!situationIds.has(id)) throw new Error(`Situation liée inconnue : ${id}`); for (const id of module.centralSources) if (!publicIds.includes(id)) throw new Error(`Source centrale inconnue : ${id}`) }
  const files = ['manifest.json', 'index.json', 'glossary.json', 'bibliography.json', 'links.json', ...names.map((name) => `modules/${name}`)]
  for (const filename of files) { const content = await readFile(path.join(OUTPUT, filename), 'utf8'); for (const pattern of forbidden) if (pattern.test(content)) throw new Error(`Contenu interdit ${pattern} dans ${filename}`) }
  const actualHash = hash(JSON.stringify(actual)); const expectedHash = hash(JSON.stringify({ manifest: expected.manifest, index: expected.index, glossary: expected.glossary, bibliography: expected.bibliography, links: expected.links, modules: expected.modules }))
  if (actualHash !== expectedHash) throw new Error('Sortie générée différente des sources canoniques')
  console.log(`Données publiques Comprendre contrôlées : 12 modules, 68 notions, 24 situations, 164 sources. Empreinte ${actualHash}.`)
}

if (process.argv[1] === new URL(import.meta.url).pathname) checkUnderstandPublicV2().catch((error) => { console.error(error.message); process.exitCode = 1 })
