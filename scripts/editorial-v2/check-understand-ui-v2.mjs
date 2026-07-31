import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = (filename) => readFile(path.join(root, filename), 'utf8')
const requireText = (content, text, label) => { if (!content.includes(text)) throw new Error(`${label} absent : ${text}`) }

const routes = await read('src/utils/appRoute.ts')
for (const text of ['#/comprendre', 'parcours\\/', 'modules\\/', 'section\\/', 'glossaire', 'bibliographie']) requireText(routes, text, 'Route Comprendre')
for (const id of Array.from({ length: 12 }, (_, index) => `M${String(index + 1).padStart(2, '0')}`)) requireText(await read('src/data/v2/understandV2.ts'), `${id}: () => import(`, 'Import dynamique fermé')
const app = await read('src/App.tsx'); requireText(app, 'lazy(() => import("./pages/understand/', 'Chargement différé'); requireText(app, 'Suspense', 'État de chargement'); requireText(app, 'UnderstandAsyncBoundary', 'État d’erreur')
const home = await read('src/pages/HomePage.tsx'); requireText(home, 'href="#/comprendre"', 'Accès accueil'); requireText(home, 'Approfondir les mécanismes, les concepts et les usages pédagogiques de Mosaïque.', 'Libellé accueil')
const pages = ['UnderstandHomePage.tsx', 'UnderstandModulesPage.tsx', 'UnderstandReadingPathPage.tsx', 'UnderstandModulePage.tsx', 'UnderstandGlossaryPage.tsx', 'UnderstandBibliographyPage.tsx']
const pageText = (await Promise.all(pages.map((name) => read(`src/pages/understand/${name}`)))).join('\n')
for (const forbidden of ['dangerouslySetInnerHTML', 'P01', 'XP01', 'mécanismeHash', 'characterBiographyHash']) if (pageText.includes(forbidden)) throw new Error(`Référence interdite dans l’interface Comprendre : ${forbidden}`)
for (const expected of ['aria-expanded', 'aria-controls', 'aria-live', 'tabIndex={-1}', 'Approfondir', 'Route non disponible']) requireText(`${pageText}\n${await read('src/components/understand/UnderstandDeepDive.tsx')}\n${await read('src/components/understand/UnderstandStates.tsx')}`, expected, 'Contrôle accessible')
const index = JSON.parse(await read('src/data/generated-v2/understand/index.json')); const glossary = JSON.parse(await read('src/data/generated-v2/understand/glossary.json')); const bibliography = JSON.parse(await read('src/data/generated-v2/understand/bibliography.json'))
if (index.modules.length !== 12 || index.readingPaths.length !== 4 || glossary.entries.length !== 68 || bibliography.entries.length !== 164) throw new Error('Cardinalités UI invalides')
if (bibliography.entries.some(({ id }) => Number(id.slice(1)) > 164)) throw new Error('Source interne routable')
console.log('Interface Comprendre contrôlée : routes, chargement différé, 12 modules, 4 parcours, 68 notions et 164 sources.')
