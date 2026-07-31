import { access, readFile } from 'node:fs/promises'
import { INTERNAL_SOURCES, MODULE_IDS, MODULE_SOURCES, TRANSVERSAL_SOURCES, parseUnderstandV2 } from './parse-understand-v2.mjs'

const fail = (message) => { throw new Error(message) }

export async function validateUnderstandV2() {
  for (const source of [...MODULE_SOURCES.map(({ path }) => path), ...Object.values(TRANSVERSAL_SOURCES), ...INTERNAL_SOURCES]) { await access(source); if (!(await readFile(source, 'utf8')).trim()) fail(`Source vide : ${source}`) }
  for (const source of MODULE_SOURCES) {
    const text = await readFile(source.path, 'utf8')
    if (!text.includes(`Module ${String(source.number).padStart(2, '0')} — ${source.title}`)) fail(`Titre invalide : ${source.id}`)
    if (!source.filename.endsWith(`_${source.version}.md`) || !/module (pilote )?validé/i.test(text)) fail(`Version ou statut invalide : ${source.id}`)
    if (!/^# L’essentiel\s*$/m.test(text) || !/^# Approfondir\s*$/m.test(text)) fail(`Structure publique invalide : ${source.id}`)
    if (source.pilot !== /module pilote validé/i.test(text)) fail(`Indicateur pilote invalide : ${source.id}`)
  }
  const controlledDocuments = [
    [TRANSVERSAL_SOURCES.summary, 'V2', 'Sommaire et parcours de lecture'],
    [TRANSVERSAL_SOURCES.glossary, 'V2', 'Glossaire transversal'],
    [TRANSVERSAL_SOURCES.links, 'V3', 'Matrice des renvois'],
    [TRANSVERSAL_SOURCES.bibliography, 'V3', 'Bibliographie générale et index des sources'],
    [INTERNAL_SOURCES[0], 'V2', 'Audit d’harmonisation générale'],
    [INTERNAL_SOURCES[1], 'V3', 'Spécification éditoriale et fonctionnelle d’intégration'],
  ]
  for (const [filename, version, title] of controlledDocuments) { const text = await readFile(filename, 'utf8'); if (!text.includes(`## ${title}`) || !text.includes(`| Version | ${version} |`) || !/\| Statut \| [^|]*validé[^|]*\|/i.test(text)) fail(`Métadonnées invalides : ${filename}`) }
  const parsed = await parseUnderstandV2()
  if (parsed.modules.map(({ id }) => id).join(',') !== MODULE_IDS.join(',')) fail('Ordre canonique invalide')
  if (MODULE_SOURCES.filter(({ version }) => version === 'V3').length !== 3 || MODULE_SOURCES.filter(({ version }) => version === 'V2').length !== 9) fail('Répartition V2/V3 invalide')
  if (parsed.diagnostics.bibliographyReadCount !== 174 || parsed.diagnostics.bibliographyInternalCount !== 10) fail('Registre bibliographique invalide')
  const expected = new Map([['N02', 'Le formulaire « Père — Mère »'], ['I14', 'Une histoire ordinaire'], ['X13', 'Une adaptation coordonnée']])
  for (const situation of parsed.links.situations) if (expected.has(situation.code) && expected.get(situation.code) !== situation.title) fail(`Titre canonique invalide : ${situation.code}`)
  const m01 = await readFile(MODULE_SOURCES[0].path, 'utf8'); const m08 = await readFile(MODULE_SOURCES[7].path, 'utf8')
  for (const label of ['V04 — Le prénom refusé', 'N02 — Le formulaire « Père — Mère »', 'I14 — Une histoire ordinaire', 'X13 — Une adaptation coordonnée']) if (!m01.includes(label)) fail(`Référence corrigée absente de M01 : ${label}`)
  if (!m08.includes('X13 — Une adaptation coordonnée')) fail('Référence corrigée absente de M08 : X13')
  for (const filename of [MODULE_SOURCES[0].path, MODULE_SOURCES[7].path]) if (/\.(?:pdf|docx?|md)\s*\(1\)/i.test(await readFile(filename, 'utf8'))) fail(`Suffixe automatique historique dans ${filename}`)
  return parsed
}

if (process.argv[1] === new URL(import.meta.url).pathname) validateUnderstandV2().then((parsed) => console.log(`Comprendre validé : ${parsed.modules.length} modules, ${parsed.glossary.entries.length} notions, ${parsed.links.situations.length} situations, ${parsed.diagnostics.bibliographyReadCount} sources lues.`)).catch((error) => { console.error(error.message); process.exitCode = 1 })
