import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const DOC_ROOT = path.join(ROOT, 'docs/editorial-v2/comprendre')
export const SCHEMA_VERSION = 'understand-public-v1'
export const MODULE_IDS = Array.from({ length: 12 }, (_, index) => `M${String(index + 1).padStart(2, '0')}`)

export const MODULE_SOURCES = [
  ['M01', 1, 'Ce que Mosaïque met en jeu', 'V3', false, '056_Espace_Comprendre_Module_01_Ce_que_Mosaique_met_en_jeu_V3.md'],
  ['M02', 2, 'De la marche des privilèges à Mosaïque', 'V3', true, '053_Espace_Comprendre_Module_02_De_la_marche_des_privileges_a_Mosaique_V3.md'],
  ['M03', 3, 'Privilèges, positions sociales et pouvoir', 'V2', false, '058_Espace_Comprendre_Module_03_Privileges_positions_sociales_et_pouvoir_V2.md'],
  ['M04', 4, 'Normes, institutions et discriminations', 'V2', false, '060_Espace_Comprendre_Module_04_Normes_institutions_et_discriminations_V2.md'],
  ['M05', 5, 'Obstacles visibles', 'V2', false, '062_Espace_Comprendre_Module_05_Obstacles_visibles_V2.md'],
  ['M06', 6, 'Normes ordinaires', 'V2', false, '064_Espace_Comprendre_Module_06_Normes_ordinaires_V2.md'],
  ['M07', 7, 'Effets invisibles', 'V2', false, '066_Espace_Comprendre_Module_07_Effets_invisibles_V2.md'],
  ['M08', 8, 'Intersectionnalité : articuler les rapports sociaux', 'V3', true, '055_Espace_Comprendre_Module_08_Intersectionnalite_et_articulation_des_rapports_sociaux_V3.md'],
  ['M09', 9, 'Dire, taire ou voir divulgué : coming in, coming out et outing', 'V2', false, '068_Espace_Comprendre_Module_09_Dire_taire_ou_voir_divulgue_V2.md'],
  ['M10', 10, 'Parcours trans et non binaires : pluralité, autonomie et temporalités', 'V2', false, '070_Espace_Comprendre_Module_10_Parcours_trans_et_non_binaires_V2.md'],
  ['M11', 11, 'De la bienveillance à la pédagogie critique', 'V2', false, '076_Espace_Comprendre_Module_11_De_la_bienveillance_a_la_pedagogie_critique_V2.md'],
  ['M12', 12, 'Utiliser Mosaïque en formation', 'V2', false, '078_Espace_Comprendre_Module_12_Utiliser_Mosaique_en_formation_V2.md'],
].map(([id, number, title, version, pilot, filename]) => ({ id, number, title, version, pilot, filename, path: path.join(DOC_ROOT, 'modules', filename) }))

export const TRANSVERSAL_SOURCES = {
  summary: path.join(DOC_ROOT, 'transversal/080_Espace_Comprendre_Sommaire_et_parcours_de_lecture_V2.md'),
  glossary: path.join(DOC_ROOT, 'transversal/081_Espace_Comprendre_Glossaire_transversal_V2.md'),
  links: path.join(DOC_ROOT, 'transversal/082_Espace_Comprendre_Matrice_des_renvois_V3.md'),
  bibliography: path.join(DOC_ROOT, 'transversal/083_Espace_Comprendre_Bibliographie_generale_et_index_des_sources_V3.md'),
}

export const INTERNAL_SOURCES = [
  path.join(DOC_ROOT, 'internal/079_Espace_Comprendre_Audit_harmonisation_generale_V2.md'),
  path.join(DOC_ROOT, 'internal/084_Espace_Comprendre_Specification_integration_fonctionnelle_V3.md'),
]

export const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const normalize = (value) => value.replace(/\r\n?/g, '\n').trim()
const splitCell = (value) => value.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'))
const moduleRefs = (value) => {
  const ids = value.match(/M(?:0[1-9]|1[0-2])/g) ?? []
  for (const match of value.matchAll(/M(\d{2})\s+à\s+M?(\d{2})/g)) for (let number = Number(match[1]); number <= Number(match[2]); number += 1) ids.push(`M${String(number).padStart(2, '0')}`)
  return [...new Set(ids)].sort()
}
const situationRefs = (value) => [...new Set((value.match(/(?:V|N|I|X)\d{2}/g) ?? []))]
const cleanLabel = (value) => value.replace(/[*_`]/g, '').trim()

function parseInline(value) {
  const segments = []
  let rest = value
  const token = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/
  while (rest) {
    const match = rest.match(token)
    if (!match) { segments.push({ type: 'text', text: rest }); break }
    if (match.index) segments.push({ type: 'text', text: rest.slice(0, match.index) })
    if (match[2] !== undefined) {
      const href = match[3].trim()
      if (!/^(https?:\/\/|#(?:\/|[a-z0-9-]))/i.test(href)) throw new Error(`URL non autorisée : ${href}`)
      segments.push({ type: 'link', label: parseInline(match[2]), href, external: /^https?:\/\//i.test(href) })
    } else if (match[4] !== undefined) segments.push({ type: 'strong', children: parseInline(match[4]) })
    else if (match[5] !== undefined) segments.push({ type: 'code', text: match[5] })
    else segments.push({ type: 'emphasis', children: parseInline(match[6]) })
    rest = rest.slice((match.index ?? 0) + match[0].length)
  }
  return segments.filter((segment) => segment.type !== 'text' || segment.text.length > 0)
}

function isBoundary(line) {
  return !line.trim() || /^#{1,6}\s/.test(line) || /^>\s?/.test(line) || /^\s*(?:[-*+] |\d+[.)] )/.test(line) || /^\|/.test(line) || /^---+$/.test(line.trim())
}

export function parseBlocks(markdown) {
  const lines = normalize(markdown).split('\n')
  const blocks = []
  for (let index = 0; index < lines.length;) {
    const line = lines[index]
    if (!line.trim() || /^---+$/.test(line.trim())) { index += 1; continue }
    if (/<\/?(?:script|style|iframe|object|embed|[A-Za-z][^>]*)>/i.test(line)) throw new Error(`HTML brut refusé : ${line}`)
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) { blocks.push({ type: 'heading', level: heading[1].length, id: '', content: parseInline(heading[2]) }); index += 1; continue }
    if (/^\|/.test(line) && index + 1 < lines.length && /^\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const headers = splitCell(line).map(parseInline)
      index += 2
      const rows = []
      while (index < lines.length && /^\|/.test(lines[index])) { const cells = splitCell(lines[index]).map(parseInline); if (cells.length !== headers.length) throw new Error(`Tableau irrégulier : ${lines[index]}`); rows.push(cells); index += 1 }
      blocks.push({ type: 'table', headers, rows }); continue
    }
    if (/^>\s?/.test(line)) {
      const parts = []
      while (index < lines.length && /^>\s?/.test(lines[index])) { parts.push(lines[index].replace(/^>\s?/, '')); index += 1 }
      blocks.push({ type: 'quote', blocks: [{ type: 'paragraph', content: parseInline(parts.join(' ')) }] }); continue
    }
    const list = line.match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.+)$/)
    if (list) {
      const ordered = Boolean(list[2]); const items = []
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.+)$/)
        if (!item || Boolean(item[2]) !== ordered) break
        let text = item[3]; index += 1
        while (index < lines.length && lines[index].trim() && !isBoundary(lines[index])) { text += ` ${lines[index].trim()}`; index += 1 }
        items.push([{ type: 'paragraph', content: parseInline(text) }])
      }
      blocks.push({ type: 'list', ordered, items }); continue
    }
    const parts = [line.trim()]; index += 1
    while (index < lines.length && !isBoundary(lines[index])) { parts.push(lines[index].trim()); index += 1 }
    blocks.push({ type: 'paragraph', content: parseInline(parts.join(' ')) })
  }
  let headingIndex = 0
  for (const block of blocks) if (block.type === 'heading') block.id = `section-${++headingIndex}-${slug(inlineText(block.content))}`
  return blocks
}

const inlineText = (segments) => segments.map((segment) => segment.type === 'text' || segment.type === 'code' ? segment.text : segment.type === 'link' ? inlineText(segment.label) : inlineText(segment.children)).join('')
const slug = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'
const paragraph = (value) => [{ type: 'paragraph', content: parseInline(value.trim()) }]

function blockText(block) {
  if (block.type === 'heading' || block.type === 'paragraph') return inlineText(block.content)
  if (block.type === 'quote') return block.blocks.map(blockText).join(' ')
  if (block.type === 'list') return block.items.flatMap((item) => item.map(blockText)).join(' ')
  if (block.type === 'table') return [...block.headers, ...block.rows.flat()].map(inlineText).join(' ')
  throw new Error(`Bloc non reconstructible : ${block.type}`)
}

function sourceText(markdown) {
  return normalize(markdown).split('\n').filter((line) => line.trim() && !/^---+$/.test(line.trim()) && !/^\|?\s*:?-{3,}/.test(line)).map((line) => {
    const cells = /^\|/.test(line) ? splitCell(line) : [line.replace(/^#{1,6}\s+|^>\s?|^\s*(?:[-*+] |\d+[.)] )/, '')]
    return cells.map((cell) => inlineText(parseInline(cell))).join(' ')
  }).join(' ').replace(/\s+/g, ' ').trim()
}

function assertFidelity(markdown, blocks, label) {
  const source = sourceText(markdown); const reconstructed = blocks.map(blockText).join(' ').replace(/\s+/g, ' ').trim()
  if (source !== reconstructed) throw new Error(`Fidélité textuelle impossible à établir : ${label}`)
}

function tableRows(markdown, firstHeader) {
  const lines = normalize(markdown).split('\n')
  for (let index = 0; index < lines.length - 1; index += 1) {
    const headers = /^\|/.test(lines[index]) ? splitCell(lines[index]) : []
    if (headers[0] === firstHeader && /^\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const rows = []
      for (index += 2; index < lines.length && /^\|/.test(lines[index]); index += 1) rows.push(splitCell(lines[index]))
      return { headers, rows }
    }
  }
  throw new Error(`Table introuvable : ${firstHeader}`)
}

function parseSummary(markdown) {
  const groups = tableRows(markdown, 'Ensemble').rows.map((row, index) => ({ id: `G${index + 1}`, label: row[0].replace(/^\d+\.\s*/, ''), moduleIds: moduleRefs(row[1]), directQuestion: row[2] }))
  const overview = tableRows(markdown, 'Module').rows
  const moduleDetails = new Map()
  const matches = [...markdown.matchAll(/^### (M\d{2}) — ([^\n]+)\n([\s\S]*?)(?=^### M\d{2} —|^## 4\.)/gm)]
  for (const match of matches) {
    const body = match[3]
    const question = body.match(/\*\*Question centrale\.\*\*\s*([^\n]+)/)?.[1]?.trim()
    const summary = body.match(/\*\*Question centrale\.\*\*[^\n]*\n\n([^\n]+)/)?.[1]?.trim()
    const times = body.match(/\*\*Lecture estimée\.\*\*\s*« L’essentiel »\s*:\s*([^;]+)\s*;\s*« Approfondir »\s*:\s*([^.]+(?:minutes)?)/)
    moduleDetails.set(match[1], { directQuestion: question, summary, readingTime: { essential: times?.[1]?.trim() ?? '', deepDive: times?.[2]?.trim() ?? '' } })
  }
  const pathMatches = [...markdown.matchAll(/^### Parcours (\d+) — ([^\n]+)\n([\s\S]*?)(?=^### Parcours|^## 5\.)/gm)]
  const readingPaths = pathMatches.map((match) => { const fields = {}; for (const field of match[3].matchAll(/^\*\*([^*]+)\*\*\s*([^\n]+)/gm)) fields[field[1].replace(/\s*:$/, '')] = field[2].trim(); return { id: `R${match[1]}`, title: match[2], order: moduleRefs(fields['Ordre conseillé'] ?? ''), objective: fields.Objectif ?? '', duration: fields['Durée indicative'] ?? '', audience: fields['Pour qui ?'] ?? '', caveat: fields['Ne remplace pas'] ?? '' } })
  if (groups.length !== 4 || readingPaths.length !== 4 || overview.length !== 12 || moduleDetails.size !== 12) throw new Error('Cardinalités invalides dans le sommaire 080')
  return { groups, overview, moduleDetails, readingPaths }
}

function parseGlossary(markdown) {
  const rows = tableRows(markdown, 'Terme').rows
  const seen = new Set()
  const entries = rows.map((row) => {
    const term = cleanLabel(row[0]); const id = slug(term)
    if (seen.has(id)) throw new Error(`Collision de glossaire : ${id}`); seen.add(id)
    const moduleIds = moduleRefs(row[3]); if (!moduleIds.length) throw new Error(`Glossaire sans module : ${term}`)
    return { id, term, shortDefinition: paragraph(row[1]), notToConfuseWith: paragraph(row[2]), moduleIds, status: /dat[ée]/i.test(row[4]) ? 'dated' : 'durable', usageNote: paragraph(row[5]) }
  })
  if (entries.length !== 68) throw new Error(`Glossaire : ${entries.length} entrées au lieu de 68`)
  return entries
}

function parseLinkMatrix(markdown) {
  const main = tableRows(markdown, 'Module').rows.slice(0, 12)
  const situations = tableRows(markdown, 'Code').rows.map((row) => ({ code: row[0], title: row[1], family: row[2], frozenRole: row[3], moduleIds: moduleRefs(row[4]) }))
  if (main.length !== 12 || situations.length !== 24) throw new Error('Cardinalités invalides dans la matrice 082')
  const moduleRelations = main.map((row) => ({ moduleId: row[0], dependencies: moduleRefs(row[1]), recommended: moduleRefs(row[2]), relatedModules: moduleRefs(row[3]), situations: situationRefs(row[4]), modes: row[5].split(/\s*;\s*/).filter(Boolean), routePolicy: 'internal-understand-route' }))
  const notionRows = tableRows(markdown.slice(markdown.indexOf('## 3.')), 'Module').rows
  const notionRelations = notionRows.slice(0, 12).map((row) => ({ moduleId: row[0], notions: row[1].split(/\s*;\s*/).map(cleanLabel).filter(Boolean), datedContent: row[3] ? [{ label: row[3], verifiedAt: '2026-07-31', scope: 'canonical-module-scope' }] : [] }))
  const modes = [...new Set(moduleRelations.flatMap((relation) => relation.modes))].map((label) => ({ label, moduleIds: moduleRelations.filter((relation) => relation.modes.includes(label)).map((relation) => relation.moduleId), routePolicy: 'activate-only-if-existing' }))
  return { moduleRelations, notionRelations, situations, modes }
}

function parseBibliography(markdown) {
  const rows = normalize(markdown).split('\n').filter((line) => /^\| S\d{3} \|/.test(line)).map(splitCell)
  const seen = new Set()
  const all = rows.map((row) => {
    if (seen.has(row[0])) throw new Error(`Source dupliquée : ${row[0]}`); seen.add(row[0])
    const blocks = paragraph(row[1]); const links = []
    const collect = (segments) => { for (const segment of segments) { if (segment.type === 'link') { links.push({ label: inlineText(segment.label), href: segment.href }); collect(segment.label) } else if (segment.children) collect(segment.children) } }
    collect(blocks[0].content)
    return { id: row[0], reference: blocks, moduleIds: moduleRefs(row[2]), nature: row[4], status: row[5], links }
  })
  if (all.length !== 174) throw new Error(`Bibliographie : ${all.length} sources au lieu de 174`)
  return { all, publicEntries: all.filter(({ id }) => Number(id.slice(1)) <= 164), internalEntries: all.filter(({ id }) => Number(id.slice(1)) >= 165) }
}

function sliceModules(markdown) {
  const essentialAt = markdown.search(/^# L’essentiel\s*$/m); const deepAt = markdown.search(/^# Approfondir\s*$/m)
  if (essentialAt < 0 || deepAt <= essentialAt) throw new Error('Frontières L’essentiel / Approfondir introuvables')
  return { essential: markdown.slice(essentialAt + markdown.slice(essentialAt).indexOf('\n') + 1, deepAt), deepDive: markdown.slice(deepAt + markdown.slice(deepAt).indexOf('\n') + 1) }
}

function deepSections(markdown) {
  const matches = [...markdown.matchAll(/^#{1,2}\s+([^\n]+)$/gm)]
  if (!matches.length) return [{ id: 'approfondir', title: 'Approfondir', blocks: parseBlocks(markdown) }]
  const sections = []
  if (matches[0].index > 0 && markdown.slice(0, matches[0].index).trim()) sections.push({ id: 'introduction', title: 'Introduction', blocks: parseBlocks(markdown.slice(0, matches[0].index)) })
  matches.forEach((match, index) => sections.push({ id: slug(match[1]), title: match[1], blocks: parseBlocks(markdown.slice(match.index + match[0].length, matches[index + 1]?.index ?? markdown.length)) }))
  const ids = sections.map(({ id }) => id); if (new Set(ids).size !== ids.length) throw new Error('Identifiants de sections dupliqués')
  return sections
}

export async function parseUnderstandV2() {
  const moduleTexts = new Map(await Promise.all(MODULE_SOURCES.map(async (source) => [source.id, normalize(await readFile(source.path, 'utf8'))])))
  const texts = Object.fromEntries(await Promise.all(Object.entries(TRANSVERSAL_SOURCES).map(async ([key, filename]) => [key, normalize(await readFile(filename, 'utf8'))])))
  const summary = parseSummary(texts.summary); const glossary = parseGlossary(texts.glossary); const links = parseLinkMatrix(texts.links); const bibliography = parseBibliography(texts.bibliography)
  const glossaryByTerm = new Map(glossary.map((entry) => [entry.term.toLocaleLowerCase('fr'), entry.id]))
  const modules = MODULE_SOURCES.map((source) => {
    const markdown = moduleTexts.get(source.id); const slices = sliceModules(markdown); const essentialBlocks = parseBlocks(slices.essential); const deepDive = deepSections(slices.deepDive)
    assertFidelity(slices.essential, essentialBlocks, `${source.id}/essential`)
    assertFidelity(slices.deepDive, parseBlocks(slices.deepDive), `${source.id}/deep-dive`)
    const detail = summary.moduleDetails.get(source.id); const relation = links.moduleRelations.find(({ moduleId }) => moduleId === source.id); const notions = links.notionRelations.find(({ moduleId }) => moduleId === source.id)
    const takeaways = essentialBlocks.filter((block) => block.type !== 'heading').slice(-4, -1)
    const professionalQuestion = essentialBlocks.filter((block) => block.type !== 'heading').slice(-2, -1)
    const debrief = deepDive.find(({ title }) => /questions de débrief/i.test(title))?.blocks ?? []
    const moduleBibliography = deepDive.filter(({ title }) => /bibliographie|sources clés/i.test(title)).flatMap(({ blocks }) => blocks)
    const centralSources = bibliography.publicEntries.filter((entry) => entry.moduleIds.includes(source.id)).map(({ id }) => id)
    return { schemaVersion: SCHEMA_VERSION, id: source.id, number: source.number, title: source.title, status: 'validated', pilot: source.pilot, directQuestion: detail.directQuestion, groupId: summary.groups.find((group) => group.moduleIds.includes(source.id))?.id, readingTime: detail.readingTime, datedContent: notions.datedContent, essential: { sections: essentialBlocks }, deepDive: { sections: deepDive }, takeaways, professionalQuestion, debriefQuestions: debrief, centralSources, moduleBibliography, related: { modules: relation.relatedModules, notions: notions.notions.map((term) => glossaryByTerm.get(term.toLocaleLowerCase('fr'))).filter(Boolean), situations: relation.situations, modes: relation.modes }, contentHash: sha256(JSON.stringify({ essentialBlocks, deepDive })) }
  })
  const index = { schemaVersion: SCHEMA_VERSION, groups: summary.groups, readingPaths: summary.readingPaths, modules: MODULE_SOURCES.map((source) => { const row = summary.overview.find((entry) => entry[0].startsWith(source.id)); const detail = summary.moduleDetails.get(source.id); const relation = links.moduleRelations.find(({ moduleId }) => moduleId === source.id); const notions = links.notionRelations.find(({ moduleId }) => moduleId === source.id); return { id: source.id, number: source.number, title: source.title, summary: detail.summary, directQuestion: detail.directQuestion, groupId: summary.groups.find((group) => group.moduleIds.includes(source.id)).id, readingTime: detail.readingTime, dependencies: relation.dependencies, relatedModules: relation.relatedModules, situations: situationRefs(row[3]), notions: notions.notions, datedContent: notions.datedContent, status: 'validated', pilot: source.pilot, dataFile: `modules/${source.id.toLowerCase()}.json` } }) }
  const publicLinks = { schemaVersion: SCHEMA_VERSION, moduleRelations: links.moduleRelations, notionRelations: links.notionRelations.map(({ moduleId, notions }) => ({ moduleId, notionIds: notions.map((term) => glossaryByTerm.get(term.toLocaleLowerCase('fr'))).filter(Boolean), routePolicy: 'internal-understand-route' })), situations: links.situations.map((entry) => ({ ...entry, routePolicy: 'activate-only-if-existing' })), modes: links.modes }
  const manifest = { schemaVersion: SCHEMA_VERSION, generatedAtPolicy: 'deterministic-no-runtime-timestamp', moduleCount: 12, glossaryEntryCount: glossary.length, publicSourceCount: bibliography.publicEntries.length, situationCount: links.situations.length, groupsCount: summary.groups.length, readingPathsCount: summary.readingPaths.length, moduleIds: MODULE_IDS, publicSourceRange: { first: 'S001', last: 'S164' }, sourceContentHashes: { modules: Object.fromEntries(MODULE_SOURCES.map((source) => [source.id, sha256(moduleTexts.get(source.id))])), summary: sha256(texts.summary), glossary: sha256(texts.glossary), links: sha256(texts.links), bibliography: sha256(texts.bibliography) } }
  return { manifest, index, glossary: { schemaVersion: SCHEMA_VERSION, entries: glossary }, bibliography: { schemaVersion: SCHEMA_VERSION, entries: bibliography.publicEntries }, links: publicLinks, modules, diagnostics: { bibliographyReadCount: bibliography.all.length, bibliographyInternalCount: bibliography.internalEntries.length } }
}
