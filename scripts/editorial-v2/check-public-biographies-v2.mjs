import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./editorial-config.mjs";
import { parsePublicBiographiesV2 } from "./parse-public-biographies-v2.mjs";
import { FORBIDDEN_PUBLIC_BIOGRAPHY_STRINGS, validatePublicBiographiesV2 } from "./validate-public-biographies-v2.mjs";

const output = join(ROOT, "src/data/generated-v2/public-biographies.json");

function fail(message) { throw new Error(`Contrôle public des biographies — ${message}`); }

function readTree(root) {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? readTree(path) : [path];
  });
}

export function checkPublicBiographiesV2() {
  if (!existsSync(output)) fail("fichier généré absent");
  const generatedText = readFileSync(output, "utf8");
  const generated = JSON.parse(generatedText);
  validatePublicBiographiesV2(generated);
  const expected = parsePublicBiographiesV2();
  if (`${JSON.stringify(expected, null, 2)}\n` !== generatedText) fail("sortie non déterministe ou périmée");
  for (const biography of generated.biographies) {
    const source = expected.biographies.find(({ id }) => id === biography.id);
    if (!source || biography.shortDescription !== source.shortDescription || biography.portraitAlt !== source.portraitAlt) fail(`${biography.id} diffère de ses sources`);
  }
  const routeSource = readFileSync(join(ROOT, "src/utils/appRoute.ts"), "utf8");
  const appSource = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
  const gallerySource = readFileSync(join(ROOT, "src/pages/ExplorerCharactersPage.tsx"), "utf8");
  const biographySource = readFileSync(join(ROOT, "src/pages/CharacterBiographyPage.tsx"), "utf8");
  if (!routeSource.includes('EXPLORER_CHARACTERS_HASH = "#/explorer/personnages"') || !routeSource.includes("characterBiographyHash") || !routeSource.includes('kind: "not-found"')) fail("routes galerie, biographies ou inconnue incomplètes");
  if (generated.biographies.some(({ name }) => routeSource.includes(`/personnages/${name}`))) fail("route fondée sur un prénom");
  if (!appSource.includes('route.kind === "explorer-characters"') || !appSource.includes('route.kind === "character-biography"') || !appSource.includes('route.kind === "not-found"')) fail("résolution des routes absente de App");
  if (!gallerySource.includes("Découvrir son parcours") || gallerySource.includes("onSelect")) fail("galerie Explorer non conforme");
  for (const title of ["Vue d’ensemble", "Son parcours", "Entourage et confidentialité", "Au lycée"]) if (!biographySource.includes(title)) fail(`accordéon absent : ${title}`);
  if (!biographySource.includes("overview: true, journey: false, privacy: false, school: false")) fail("état initial des accordéons incorrect");
  if (!biographySource.includes("Retour aux personnages") || !biographySource.includes("À propos de cette fiche")) fail("retour ou note narrative absent");
  return generated.biographies.length;
}

export function checkPublicBiographyDist() {
  const dist = join(ROOT, "dist");
  if (!existsSync(dist)) fail("dist absent");
  const files = readTree(dist).filter((path) => /\.(?:html|js|css|json|txt|map)$/i.test(path));
  const contents = files.map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of FORBIDDEN_PUBLIC_BIOGRAPHY_STRINGS) if (contents.includes(forbidden)) fail(`chaîne interdite dans dist : ${forbidden}`);
  return files.length;
}

function main() {
  try {
    if (process.argv.includes("--dist")) console.log(`Contrôle de dist réussi : ${checkPublicBiographyDist()} fichiers textuels inspectés`);
    else console.log(`Contrôle public réussi : ${checkPublicBiographiesV2()} biographies conformes`);
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : String(cause));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
