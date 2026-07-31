import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'); const dist = path.join(root, 'dist'); const assets = path.join(dist, 'assets')
const assetNames = (await readdir(assets)).filter((name) => name.endsWith('.js'))
const files = new Map(await Promise.all(assetNames.map(async (name) => [name, await readFile(path.join(assets, name), 'utf8')])))
const html = await readFile(path.join(dist, 'index.html'), 'utf8'); const initialName = html.match(/<script[^>]+src="[^"]*\/([^/"]+\.js)"/)?.[1]
if (!initialName || !files.has(initialName)) throw new Error('Bundle initial introuvable dans dist/index.html')
const initial = files.get(initialName)
for (const forbidden of ['Ce que Mosaïque met en jeu', 'Utiliser Mosaïque en formation', 'S164', 'Acte observable']) if (initial.includes(forbidden)) throw new Error(`Contenu différé présent dans le bundle initial : ${forbidden}`)
const all = [...files.values()].join('\n')
for (const forbidden of [/Dossier_de_recherche/i, /Audit_et_Architecture/i, /Audit_harmonisation/i, /Gabarit_editorial/i, /\bDR\d{3}\b/, /\bS(?:16[5-9]|17[0-4])\b/, /\.(?:pdf|docx?|md)\s*\(1\)/i, /Volet réservé au formateur/i, /Données opératoires/i, /Données contextuelles/i, /Informations confidentielles dans l’univers du personnage/i, /Conflits potentiels avec la matrice/i, /\/home\//]) if (forbidden.test(all)) throw new Error(`Contenu interdit dans dist : ${forbidden}`)
const moduleTitles = ['Ce que Mosaïque met en jeu', 'De la marche des privilèges à Mosaïque', 'Privilèges, positions sociales et pouvoir', 'Normes, institutions et discriminations', 'Obstacles visibles', 'Normes ordinaires', 'Effets invisibles', 'Intersectionnalité : articuler les rapports sociaux', 'Dire, taire ou voir divulgué : coming in, coming out et outing', 'Parcours trans et non binaires : pluralité, autonomie et temporalités', 'De la bienveillance à la pédagogie critique', 'Utiliser Mosaïque en formation']
const moduleChunks = moduleTitles.map((title, index) => { const prefix = `m${String(index + 1).padStart(2, '0')}-`; const matches = [...files].filter(([name, content]) => name.startsWith(prefix) && content.includes(title)).map(([name]) => name); if (matches.length !== 1) throw new Error(`Chunk unique introuvable pour le module : ${title}`); return matches[0] })
if (new Set(moduleChunks).size !== 12) throw new Error('Les douze modules ne sont pas séparément chargeables')
const findChunk = (needles, label, prefix) => { const match = [...files].find(([name, content]) => (!prefix || name.startsWith(prefix)) && needles.every((needle) => content.includes(needle))); if (!match) throw new Error(`Chunk ${label} introuvable`); return match[0] }
const glossaryChunk = findChunk(['Acte observable', 'Valeur par défaut'], 'glossaire', 'glossary-'); const bibliographyChunk = findChunk(['S001', 'S164'], 'bibliographie', 'bibliography-'); const indexChunk = findChunk(['Entrer dans Mosaïque', 'Analyser et animer'], 'index', 'understand-')
if ([glossaryChunk, bibliographyChunk, indexChunk].includes(initialName) || glossaryChunk === bibliographyChunk) throw new Error('Séparation différée des données invalide')
const sizes = Object.fromEntries(await Promise.all([initialName, glossaryChunk, bibliographyChunk, indexChunk, ...moduleChunks].map(async (name) => [name, (await stat(path.join(assets, name))).size])))
const understandNames = [...new Set([...moduleChunks, glossaryChunk, bibliographyChunk, indexChunk, ...assetNames.filter((name) => /Understand|understand|links-/i.test(name))])]; const total = (await Promise.all(understandNames.map(async (name) => (await stat(path.join(assets, name))).size))).reduce((sum, size) => sum + size, 0)
console.log(JSON.stringify({ initial: { name: initialName, bytes: sizes[initialName] }, pageChunks: assetNames.filter((name) => /Understand/i.test(name)), index: { name: indexChunk, bytes: sizes[indexChunk] }, glossary: { name: glossaryChunk, bytes: sizes[glossaryChunk] }, bibliography: { name: bibliographyChunk, bytes: sizes[bibliographyChunk] }, modules: Object.fromEntries(moduleChunks.map((name, index) => [`M${String(index + 1).padStart(2, '0')}`, { name, bytes: sizes[name] }])), totalDeferredUnderstandBytes: total }, null, 2))
