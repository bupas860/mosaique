import type { EditorialCharacterIdV2 } from "../types/editorialV2";

export type AppRoute =
  | { readonly kind: "game" }
  | { readonly kind: "explorer-characters" }
  | { readonly kind: "character-biography"; readonly characterId: EditorialCharacterIdV2 }
  | { readonly kind: "not-found"; readonly fragment: string };

const characterIds = new Set<EditorialCharacterIdV2>([
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09",
  "XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08",
]);

export const EXPLORER_CHARACTERS_HASH = "#/explorer/personnages";

export function characterBiographyHash(characterId: EditorialCharacterIdV2): string {
  return `${EXPLORER_CHARACTERS_HASH}/${characterId}`;
}

export function parseAppRoute(hash = window.location.hash): AppRoute {
  if (!hash || hash === "#" || hash === "#/") return { kind: "game" };
  if (hash === EXPLORER_CHARACTERS_HASH) return { kind: "explorer-characters" };
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
