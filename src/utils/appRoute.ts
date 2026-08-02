import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { UnderstandModuleId } from "../types/understand";

export type AppRoute =
  | { readonly kind: "home" }
  | { readonly kind: "game" }
  | { readonly kind: "explorer-characters" }
  | { readonly kind: "character-biography"; readonly characterId: EditorialCharacterIdV2 }
  | { readonly kind: "situations" }
  | { readonly kind: "situations-focal"; readonly focalSlug: "obstacles-visibles" | "normes-ordinaires" | "effets-invisibles" | "intersectionnalites" }
  | { readonly kind: "situation-detail"; readonly code: string }
  | { readonly kind: "reperes" }
  | { readonly kind: "redirect"; readonly target: string }
  | { readonly kind: "not-found"; readonly fragment: string };

const characterIds = new Set<EditorialCharacterIdV2>([
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09",
  "XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08",
]);

const situationCodes = new Set([
  ...Array.from({ length: 16 }, (_, index) => `V${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 13 }, (_, index) => `N${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 16 }, (_, index) => `I${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 16 }, (_, index) => `X${String(index + 1).padStart(2, "0")}`),
]);

const focalSlugs = new Set(["obstacles-visibles", "normes-ordinaires", "effets-invisibles", "intersectionnalites"] as const);

export const HOME_HASH = "#/";
export const GAME_HASH = "#/jouer";
export const PERSONNAGES_HASH = "#/personnages";
export const SITUATIONS_HASH = "#/situations";
export const REPERES_HASH = "#/reperes";
export const LEGACY_EXPLORER_CHARACTERS_HASH = "#/explorer/personnages";
export const EXPLORER_CHARACTERS_HASH = PERSONNAGES_HASH;
export const UNDERSTAND_HASH = "#/comprendre";
export const UNDERSTAND_MODULES_HASH = `${UNDERSTAND_HASH}/modules`;

export const understandReadingPathHash = (pathId: string) => `${UNDERSTAND_HASH}/parcours/${pathId}`;
export const understandModuleHash = (moduleId: UnderstandModuleId, sectionId?: string) => `${UNDERSTAND_MODULES_HASH}/${moduleId}${sectionId ? `/section/${sectionId}` : ""}`;
export const understandGlossaryHash = (notionId?: string) => `${UNDERSTAND_HASH}/glossaire${notionId ? `/${notionId}` : ""}`;
export const understandBibliographyHash = (sourceId?: string) => `${UNDERSTAND_HASH}/bibliographie${sourceId ? `/${sourceId}` : ""}`;

export function characterBiographyHash(characterId: EditorialCharacterIdV2): string {
  return `${LEGACY_EXPLORER_CHARACTERS_HASH}/${characterId}`;
}

function isLegacyUnderstandRoute(hash: string): boolean {
  return hash === UNDERSTAND_HASH
    || hash === UNDERSTAND_MODULES_HASH
    || /^#\/comprendre\/parcours\/R[1-4]$/.test(hash)
    || /^#\/comprendre\/modules\/M(?:0[1-9]|1[0-2])(?:\/section\/[a-z0-9-]+)?$/.test(hash)
    || /^#\/comprendre\/glossaire(?:\/[a-z0-9-]+)?$/.test(hash)
    || /^#\/comprendre\/bibliographie(?:\/S\d{3})?$/.test(hash);
}

export function parseAppRoute(hash = window.location.hash): AppRoute {
  if (!hash || hash === "#" || hash === HOME_HASH) return { kind: "home" };
  if (hash === GAME_HASH) return { kind: "game" };
  if (hash === PERSONNAGES_HASH) return { kind: "explorer-characters" };
  if (hash === SITUATIONS_HASH) return { kind: "situations" };
  const focalRoute = hash.match(/^#\/situations\/focales\/([a-z-]+)$/);
  if (focalRoute && focalSlugs.has(focalRoute[1] as never)) return { kind: "situations-focal", focalSlug: focalRoute[1] as "obstacles-visibles" | "normes-ordinaires" | "effets-invisibles" | "intersectionnalites" };
  if (hash === "#/situations/quiz") return { kind: "not-found", fragment: hash };
  const situationRoute = hash.match(/^#\/situations\/([vnix]\d{2})$/i);
  if (situationRoute) {
    const code = situationRoute[1].toUpperCase();
    if (!situationCodes.has(code)) return { kind: "not-found", fragment: hash };
    if (situationRoute[1] !== code) return { kind: "redirect", target: `${SITUATIONS_HASH}/${code}` };
    return { kind: "situation-detail", code };
  }
  if (hash === REPERES_HASH) return { kind: "reperes" };
  if (hash === LEGACY_EXPLORER_CHARACTERS_HASH) return { kind: "redirect", target: PERSONNAGES_HASH };
  if (isLegacyUnderstandRoute(hash)) return { kind: "redirect", target: REPERES_HASH };
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
