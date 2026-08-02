import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const normalize = (filename) => filename.split(path.sep).join("/");
const relative = (filename) => normalize(path.relative(root, filename));
const result = await build({
  root,
  logLevel: "warn",
  build: { write: false },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(({ output }) => output);
const chunks = outputs.filter((item) => item.type === "chunk");
const byFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
const mainChunk = chunks.find((chunk) => chunk.isEntry);
const gameChunk = chunks.find((chunk) => Object.keys(chunk.modules).some((id) => relative(id) === "src/game/GameApp.tsx"));
const situationsChunk = chunks.find((chunk) => Object.keys(chunk.modules).some((id) => relative(id) === "src/features/situations/SituationsApp.tsx"));
const charactersChunk = chunks.find((chunk) => Object.keys(chunk.modules).some((id) => relative(id) === "src/features/characters/CharactersApp.tsx"));
if (!mainChunk) throw new Error("Chunk d’entrée principal introuvable");
if (!gameChunk) throw new Error("Chunk du point d’entrée Jouer introuvable");
if (!situationsChunk) throw new Error("Chunk du point d’entrée Situations introuvable");
if (!charactersChunk) throw new Error("Chunk du point d’entrée Personnages introuvable");
if (mainChunk.fileName === gameChunk.fileName) throw new Error("Le point d’entrée Jouer est fusionné avec le chunk principal");
if (mainChunk.fileName === situationsChunk.fileName || gameChunk.fileName === situationsChunk.fileName) throw new Error("Le point d’entrée Situations n’est pas isolé des chunks principal et Jouer");
if ([mainChunk.fileName, gameChunk.fileName, situationsChunk.fileName].includes(charactersChunk.fileName)) throw new Error("Le point d’entrée Personnages n’est pas isolé des autres périmètres");

const operativePatterns = [
  /^src\/game\//,
  /^src\/engine\//,
  /^src\/pages\/(?:HomePage|ModeSelectionPage|CharacterSelectionPage|GamePage|FinalSummaryPage)\.tsx$/,
  /^src\/data\/gameModes\.ts$/,
  /^src\/data\/v2\/(?:activeModesRuntimeV2|allModesRuntimeV2|generatedV2Data|index|runtimeIndexV2|runtimeV2)\.ts$/,
  /^src\/data\/generated-v2\/(?:characters\.json|galleries\/|modes\/)/,
];
const operativeModules = (chunk) => Object.keys(chunk.modules).map(relative).filter((id) => operativePatterns.some((pattern) => pattern.test(id)));

function reachable(startFiles, includeDynamic) {
  const visited = new Set();
  const queue = [...startFiles];
  while (queue.length > 0) {
    const filename = queue.shift();
    if (visited.has(filename)) continue;
    visited.add(filename);
    const chunk = byFile.get(filename);
    if (!chunk) continue;
    queue.push(...chunk.imports);
    if (includeDynamic && filename !== mainChunk.fileName) queue.push(...chunk.dynamicImports);
  }
  return visited;
}

const mainStatic = reachable([mainChunk.fileName], false);
for (const filename of mainStatic) {
  const internal = operativeModules(byFile.get(filename));
  if (internal.length > 0) throw new Error(`Module opératoire dans le graphe principal ${filename} : ${internal.join(", ")}`);
}

const gameGraph = reachable([gameChunk.fileName], true);
const gameOperational = [...gameGraph].flatMap((filename) => operativeModules(byFile.get(filename)).map((moduleId) => ({ filename, moduleId })));
if (!gameOperational.some(({ moduleId }) => moduleId === "src/data/v2/activeModesRuntimeV2.ts")) {
  throw new Error("Le runtime actif n’est pas associé au graphe de chunks Jouer");
}
const completeBiographyModules = ["src/data/public/publicCharacters.generated.json", "src/data/v2/publicBiographiesV2.ts"];
const graphModules = (graph) => [...graph].flatMap((filename) => Object.keys(byFile.get(filename)?.modules ?? {}).map(relative));
for (const [label, graph] of [["principal", mainStatic], ["Jouer", gameGraph], ["Situations", reachable([situationsChunk.fileName], true)]]) {
  const leaked = graphModules(graph).filter((id) => completeBiographyModules.includes(id));
  if (leaked.length > 0) throw new Error(`Biographies complètes dans le graphe ${label} : ${leaked.join(", ")}`);
}
if (!graphModules(reachable([charactersChunk.fileName], true)).includes("src/data/public/publicCharacters.generated.json")) throw new Error("Artefact biographique absent du graphe Personnages");

const editorialDynamicRoots = mainChunk.dynamicImports.filter((filename) => filename !== gameChunk.fileName);
const editorialGraph = reachable(editorialDynamicRoots, true);
for (const filename of editorialGraph) {
  const internal = operativeModules(byFile.get(filename));
  if (internal.length > 0) throw new Error(`Module opératoire dans un chunk éditorial ${filename} : ${internal.join(", ")}`);
}

for (const chunk of chunks) {
  const internal = operativeModules(chunk);
  if (internal.length > 0 && !gameGraph.has(chunk.fileName)) {
    throw new Error(`Chunk opératoire hors du graphe Jouer ${chunk.fileName} : ${internal.join(", ")}`);
  }
}

console.log(`Chunks contrôlés sans écriture : ${chunks.length}.`);
console.log(`Entrée principale : ${mainChunk.fileName} (${Object.keys(mainChunk.modules).length} modules, aucun module opératoire).`);
console.log(`Graphe Jouer : ${gameGraph.size} chunk(s), ${gameOperational.length} module(s) opératoire(s).`);
console.log(`Chunk Situations : ${situationsChunk.fileName} (${Object.keys(situationsChunk.modules).length} modules, aucun module opératoire).`);
console.log(`Chunk Personnages : ${charactersChunk.fileName} (${Object.keys(charactersChunk.modules).length} modules, aucun module opératoire).`);
console.log(`Graphe éditorial différé : ${editorialGraph.size} chunk(s), aucun module opératoire.`);
