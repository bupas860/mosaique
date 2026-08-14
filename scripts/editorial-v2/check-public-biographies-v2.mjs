import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./editorial-config.mjs";
import { parsePublicBiographiesV2 } from "./parse-public-biographies-v2.mjs";
import { FORBIDDEN_PUBLIC_BIOGRAPHY_STRINGS, validatePublicBiographiesV2 } from "./validate-public-biographies-v2.mjs";

const output = join(ROOT, "src/data/generated-v2/public-biographies.json");
const alternativesOutput = join(ROOT, "src/data/generated-v2/public-character-alts.json");
const publicCharactersOutput = join(ROOT, "src/data/public/publicCharacters.generated.json");
const publicCharacterSummariesOutput = join(ROOT, "src/data/public/publicCharacterSummaries.generated.json");

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
  const alternatives = JSON.parse(readFileSync(alternativesOutput, "utf8"));
  if (Object.keys(alternatives).length !== 17) fail("projection des alternatives incomplète");
  for (const biography of generated.biographies) if (alternatives[biography.id] !== biography.portraitAlt) fail(`${biography.id} : projection alternative différente`);
  const publicCharacters = JSON.parse(readFileSync(publicCharactersOutput, "utf8"));
  if (publicCharacters.generatedNotice !== "Fichier généré. Ne pas modifier manuellement." || JSON.stringify(publicCharacters.biographies) !== JSON.stringify(generated.biographies)) fail("artefact navigateur Personnages incomplet ou différent");
  const publicCharacterSummaries = JSON.parse(readFileSync(publicCharacterSummariesOutput, "utf8"));
  if (publicCharacterSummaries.generatedNotice !== "Fichier généré. Ne pas modifier manuellement." || publicCharacterSummaries.summaries.length !== 17) fail("projection des descriptions courtes incomplète");
  for (const biography of generated.biographies) if (publicCharacterSummaries.summaries.find(({ id }) => id === biography.id)?.shortDescription !== biography.shortDescription) fail(`${biography.id} : description courte projetée différente`);
  const routeSource = readFileSync(join(ROOT, "src/utils/appRoute.ts"), "utf8");
  const appSource = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
  const gallerySource = readFileSync(join(ROOT, "src/pages/ExplorerCharactersPage.tsx"), "utf8");
  const biographySource = readFileSync(join(ROOT, "src/pages/CharacterBiographyPage.tsx"), "utf8");
  const selectionSource = readFileSync(join(ROOT, "src/pages/CharacterSelectionPage.tsx"), "utf8");
  const publicTagsSource = readFileSync(join(ROOT, "src/data/v2/characterPublicTagsV2.ts"), "utf8");
  const publicTagsProjection = readFileSync(join(ROOT, "src/data/public/characterPublicTagsV2.ts"), "utf8");
  const publicTagsComponent = readFileSync(join(ROOT, "src/components/CharacterPublicTags.tsx"), "utf8");
  if (!routeSource.includes('PERSONNAGES_HASH = "#/personnages"') || !routeSource.includes('LEGACY_EXPLORER_CHARACTERS_HASH = "#/explorer/personnages"') || !routeSource.includes("characterBiographyHash") || !routeSource.includes('kind: "not-found"')) fail("routes galerie, biographies ou inconnue incomplètes");
  if (generated.biographies.some(({ name }) => routeSource.includes(`/personnages/${name}`))) fail("route fondée sur un prénom");
  if (!appSource.includes('route.kind === "explorer-characters"') || !appSource.includes('route.kind === "character-biography"') || !appSource.includes("return <NotFoundPage />")) fail("résolution des routes absente de App");
  if (!gallerySource.includes("Découvrir son parcours") || gallerySource.includes("onSelect")) fail("galerie Explorer non conforme");
  const expectedIds = ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08"];
  if (generated.biographies.map(({ id }) => id).join(",") !== expectedIds.join(",")) fail("les 17 identifiants de personnages ne sont pas disponibles dans l’ordre canonique");
  const homonyms = [["P01", "XP08"], ["P02", "XP05"], ["P05", "XP06"], ["P08", "XP07"]];
  for (const [firstId, secondId] of homonyms) {
    const first = generated.biographies.find(({ id }) => id === firstId);
    const second = generated.biographies.find(({ id }) => id === secondId);
    if (!first || !second || first.name !== second.name) fail(`couple d’homonymes distinct absent : ${firstId}/${secondId}`);
  }
  if (!publicTagsSource.includes('from "../public/characterPublicTagsV2"') || !publicTagsSource.includes("publicCharacterTagsV2[characterId]")) fail("projection publique ou jointure par identifiant des étiquettes absente");
  if (publicTagsSource.includes("playableCharactersV2") || publicTagsSource.includes("intersectionalCharactersV2") || publicTagsProjection.includes("feedbacksByCharacter") || publicTagsProjection.includes("gamePoints")) fail("dépendance opératoire présente dans les étiquettes publiques");
  for (const id of expectedIds) if (!publicTagsProjection.includes(`${id}: [`)) fail(`étiquettes publiques absentes : ${id}`);
  if (publicTagsSource.includes("character.name") || publicTagsSource.includes("biography.name")) fail("jointure des étiquettes fondée sur un prénom");
  if (!publicTagsComponent.includes("getCharacterPublicTagsV2(characterId)") || !publicTagsComponent.includes("<ul") || !publicTagsComponent.includes("<li")) fail("composant sémantique partagé des étiquettes absent");
  for (const [label, source] of [["sélection", selectionSource], ["galerie Explorer", gallerySource], ["fiche biographique", biographySource]]) {
    if (!source.includes("<CharacterPublicTags") || !source.includes("characterId=")) fail(`étiquettes publiques absentes de la ${label}`);
  }
  for (const title of ["Vue d’ensemble", "Son parcours", "Entourage et confidentialité", "Au lycée"]) if (!biographySource.includes(title)) fail(`onglet absent : ${title}`);
  if (!biographySource.includes('useState<(typeof groups)[number]["id"]>("overview")')) fail("onglet Vue d’ensemble non sélectionné initialement");
  if (!biographySource.includes("Retour aux personnages") || biographySource.includes("À propos de cette fiche") || biographySource.includes("Sommaire de la fiche")) fail("retour ou retrait des blocs obsolètes non conforme");
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
