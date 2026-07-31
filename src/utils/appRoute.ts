import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { UnderstandModuleId } from "../types/understand";

export type AppRoute =
  | { readonly kind: "game" }
  | { readonly kind: "explorer-characters" }
  | { readonly kind: "character-biography"; readonly characterId: EditorialCharacterIdV2 }
  | { readonly kind: "understand-home" }
  | { readonly kind: "understand-modules" }
  | { readonly kind: "understand-reading-path"; readonly pathId: string }
  | { readonly kind: "understand-module"; readonly moduleId: UnderstandModuleId; readonly sectionId?: string }
  | { readonly kind: "understand-glossary"; readonly notionId?: string }
  | { readonly kind: "understand-bibliography"; readonly sourceId?: string }
  | { readonly kind: "not-found"; readonly fragment: string };

const characterIds = new Set<EditorialCharacterIdV2>([
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09",
  "XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08",
]);

export const EXPLORER_CHARACTERS_HASH = "#/explorer/personnages";
export const UNDERSTAND_HASH = "#/comprendre";
export const UNDERSTAND_MODULES_HASH = `${UNDERSTAND_HASH}/modules`;

export const understandReadingPathHash = (pathId: string) => `${UNDERSTAND_HASH}/parcours/${pathId}`;
export const understandModuleHash = (moduleId: UnderstandModuleId, sectionId?: string) => `${UNDERSTAND_MODULES_HASH}/${moduleId}${sectionId ? `/section/${sectionId}` : ""}`;
export const understandGlossaryHash = (notionId?: string) => `${UNDERSTAND_HASH}/glossaire${notionId ? `/${notionId}` : ""}`;
export const understandBibliographyHash = (sourceId?: string) => `${UNDERSTAND_HASH}/bibliographie${sourceId ? `/${sourceId}` : ""}`;

export function characterBiographyHash(characterId: EditorialCharacterIdV2): string {
  return `${EXPLORER_CHARACTERS_HASH}/${characterId}`;
}

export function parseAppRoute(hash = window.location.hash): AppRoute {
  if (!hash || hash === "#" || hash === "#/") return { kind: "game" };
  if (hash === EXPLORER_CHARACTERS_HASH) return { kind: "explorer-characters" };
  if (hash === UNDERSTAND_HASH) return { kind: "understand-home" };
  if (hash === UNDERSTAND_MODULES_HASH) return { kind: "understand-modules" };
  const readingPath = hash.match(/^#\/comprendre\/parcours\/(R[1-4])$/);
  if (readingPath) return { kind: "understand-reading-path", pathId: readingPath[1] };
  const module = hash.match(/^#\/comprendre\/modules\/(M(?:0[1-9]|1[0-2]))(?:\/section\/([a-z0-9-]+))?$/);
  if (module) return { kind: "understand-module", moduleId: module[1] as UnderstandModuleId, sectionId: module[2] };
  const glossary = hash.match(/^#\/comprendre\/glossaire(?:\/([a-z0-9-]+))?$/);
  if (glossary) return { kind: "understand-glossary", notionId: glossary[1] };
  const bibliography = hash.match(/^#\/comprendre\/bibliographie(?:\/(S\d{3}))?$/);
  if (bibliography) return { kind: "understand-bibliography", sourceId: bibliography[1] };
  const match = hash.match(/^#\/explorer\/personnages\/(P\d{2}|XP\d{2})$/);
  if (match) {
    const characterId = match[1] as EditorialCharacterIdV2;
    return characterIds.has(characterId) ? { kind: "character-biography", characterId } : { kind: "not-found", fragment: hash };
  }
  return { kind: "not-found", fragment: hash };
}

export function subscribeAppRoute(listener: () => void): () => void {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
