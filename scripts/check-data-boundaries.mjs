import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "src");
const relative = (filename) => path.relative(root, filename).split(path.sep).join("/");

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filename);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [filename] : [];
  }));
  return nested.flat();
}

const configFile = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.app.json");
if (!configFile) throw new Error("tsconfig.app.json introuvable");
const config = ts.parseJsonConfigFileContent(
  ts.readConfigFile(configFile, ts.sys.readFile).config,
  ts.sys,
  root,
);

function importKind(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    const named = clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
      ? clause.namedBindings.elements
      : [];
    const typeOnly = Boolean(clause?.isTypeOnly)
      || Boolean(clause && !clause.name && named.length > 0 && named.every((element) => element.isTypeOnly));
    return { specifier: node.moduleSpecifier.text, dynamic: false, typeOnly };
  }
  if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
    return { specifier: node.moduleSpecifier.text, dynamic: false, typeOnly: node.isTypeOnly };
  }
  if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
    const argument = node.arguments[0];
    if (argument && ts.isStringLiteral(argument)) {
      return { specifier: argument.text, dynamic: true, typeOnly: false };
    }
  }
  return undefined;
}

function collectImports(sourceFile) {
  const imports = [];
  function visit(node) {
    const current = importKind(node);
    if (current) imports.push(current);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return imports;
}

function resolveImport(specifier, containingFile) {
  return ts.resolveModuleName(specifier, containingFile, config.options, ts.sys).resolvedModule?.resolvedFileName;
}

const filenames = await sourceFiles(sourceRoot);
const graph = new Map();
for (const filename of filenames) {
  const content = await readFile(filename, "utf8");
  const parsed = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true);
  const edges = collectImports(parsed)
    .filter(({ typeOnly }) => !typeOnly)
    .map((edge) => ({ ...edge, target: resolveImport(edge.specifier, filename) }))
    .filter(({ target }) => target?.startsWith(sourceRoot));
  graph.set(filename, edges);
}

const operativePatterns = [
  /^src\/game\//,
  /^src\/engine\//,
  /^src\/pages\/(?:HomePage|ModeSelectionPage|CharacterSelectionPage|GamePage|FinalSummaryPage)\.tsx$/,
  /^src\/data\/gameModes\.ts$/,
  /^src\/data\/v2\/(?:activeModesRuntimeV2|allModesRuntimeV2|generatedV2Data|index|runtimeIndexV2|runtimeV2)\.ts$/,
  /^src\/data\/generated-v2\/(?:characters\.json|galleries\/|modes\/)/,
];
const isOperative = (filename) => operativePatterns.some((pattern) => pattern.test(relative(filename)));

const publicRoots = filenames.filter((filename) => [
  /^src\/pages\/(?:ExplorerCharactersPage|CharacterBiographyPage)\.tsx$/,
  /^src\/pages\/public\//,
  /^src\/components\/public\//,
  /^src\/features\/situations\//,
  /^src\/features\/characters\//,
  /^src\/features\/(?:reperes|useful-words|reference)\//,
  /^src\/pages\/understand\//,
  /^src\/components\/understand\//,
  /^src\/data\/public\//,
  /^src\/data\/v2\/(?:characterPortraitsV2|characterPublicTagsV2|publicBiographiesV2|understandV2)\.ts$/,
].some((pattern) => pattern.test(relative(filename))));

const sharedRoots = filenames.filter((filename) => [
  "src/components/AppBackground.tsx",
  "src/components/Button.tsx",
  "src/components/CharacterPortrait.tsx",
  "src/components/CharacterPublicTags.tsx",
  "src/components/Illustration.tsx",
  "src/components/Screen.tsx",
].includes(relative(filename)));

function findForbiddenChain(roots, forbidden, includeDynamic = true) {
  const queue = roots.map((filename) => ({ filename, chain: [filename] }));
  const visited = new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current.filename)) continue;
    visited.add(current.filename);
    if (current.chain.length > 1 && forbidden(current.filename)) return current.chain;
    for (const edge of graph.get(current.filename) ?? []) {
      if (!includeDynamic && edge.dynamic) continue;
      queue.push({ filename: edge.target, chain: [...current.chain, edge.target] });
    }
  }
  return undefined;
}

function assertNoForbiddenChain(label, roots, forbidden, includeDynamic = true) {
  const chain = findForbiddenChain(roots, forbidden, includeDynamic);
  if (chain) {
    throw new Error(`${label} : chaîne d’import interdite\n${chain.map((filename) => `  -> ${relative(filename)}`).join("\n")}`);
  }
}

assertNoForbiddenChain("Périmètre éditorial public", publicRoots, isOperative);
assertNoForbiddenChain("Composants partagés", sharedRoots, isOperative);

const appEntry = path.join(sourceRoot, "App.tsx");
assertNoForbiddenChain("Socle applicatif statique", [appEntry], isOperative, false);
const appDynamicImports = (graph.get(appEntry) ?? []).filter(({ dynamic }) => dynamic);
const gameEntry = path.join(sourceRoot, "game", "GameApp.tsx");
if (!appDynamicImports.some(({ target }) => target === gameEntry)) {
  throw new Error("Le point d’entrée général doit charger dynamiquement src/game/GameApp.tsx");
}
const unexpectedOperativeDynamic = appDynamicImports.filter(({ target }) => isOperative(target) && target !== gameEntry);
if (unexpectedOperativeDynamic.length > 0) {
  throw new Error(`Import opératoire dynamique non centralisé : ${unexpectedOperativeDynamic.map(({ target }) => relative(target)).join(", ")}`);
}
if (!findForbiddenChain([gameEntry], (filename) => /src\/data\/v2\/activeModesRuntimeV2\.ts$/.test(relative(filename)))) {
  throw new Error("Le point d’entrée Jouer ne donne pas accès au runtime actif");
}

const publicBarrels = filenames.filter((filename) => /src\/data\/public\/(?:index\.)?tsx?$/.test(relative(filename)));
for (const barrel of publicBarrels) assertNoForbiddenChain(`Façade publique ${relative(barrel)}`, [barrel], isOperative);

function testGraphSearch() {
  const fixture = new Map([
    ["public", [{ target: "middle", dynamic: false }]],
    ["middle", [{ target: "internal", dynamic: true }]],
    ["internal", []],
  ]);
  const original = new Map(graph);
  graph.clear();
  for (const [key, value] of fixture) graph.set(key, value);
  const chain = findForbiddenChain(["public"], (value) => value === "internal");
  graph.clear();
  for (const [key, value] of original) graph.set(key, value);
  if (chain?.join(" -> ") !== "public -> middle -> internal") {
    throw new Error("Autotest : les imports indirects ou dynamiques ne sont pas détectés");
  }
}
testGraphSearch();

const tagModule = path.join(sourceRoot, "data", "public", "characterPublicTagsV2.ts");
const transpiled = ts.transpileModule(await readFile(tagModule, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
}).outputText;
const publicTags = (await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`)).publicCharacterTagsV2;
const general = JSON.parse(await readFile(path.join(sourceRoot, "data/generated-v2/galleries/general.json"), "utf8")).characters;
const intersectional = JSON.parse(await readFile(path.join(sourceRoot, "data/generated-v2/galleries/intersectional.json"), "utf8")).characters;
function deriveTags(character) {
  if ("profile" in character) {
    return character.profile.split("—").slice(1).flatMap((part) => part.split(".")).map((part) => part.trim()).filter(Boolean).slice(0, 3);
  }
  const tags = [character.genderIdentity, character.orientation, character.pronouns.length > 0 ? `Pronom : ${character.pronouns.join(", ")}` : undefined].filter(Boolean);
  if (tags.length < 2) {
    const sentence = character.presentation.split(".")[0]?.trim();
    if (sentence) tags.push(sentence);
  }
  return tags.slice(0, 3);
}
const sourceCharacters = [...general, ...intersectional];
if (Object.keys(publicTags).length !== sourceCharacters.length) throw new Error("Projection publique des étiquettes incomplète");
for (const character of sourceCharacters) {
  if (JSON.stringify(publicTags[character.id]) !== JSON.stringify(deriveTags(character))) {
    throw new Error(`Projection publique des étiquettes divergente : ${character.id}`);
  }
}

console.log(`Frontières statiques contrôlées : ${filenames.length} modules TypeScript, ${publicRoots.length} racines éditoriales, ${sharedRoots.length} composants partagés.`);
console.log("Chargement dynamique Jouer, imports indirects et projection publique des étiquettes : conformes.");
