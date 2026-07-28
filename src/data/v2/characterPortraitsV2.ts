import p02Portrait from "../../assets/illustrations/characters/general/p02.webp";
import p03Portrait from "../../assets/illustrations/characters/general/p03.webp";
import p04Portrait from "../../assets/illustrations/characters/general/p04.webp";
import p05Portrait from "../../assets/illustrations/characters/general/p05.webp";
import p09Portrait from "../../assets/illustrations/characters/general/p09.webp";
import xp01Portrait from "../../assets/illustrations/characters/intersectional/xp01.webp";
import xp02Portrait from "../../assets/illustrations/characters/intersectional/xp02.webp";
import xp05Portrait from "../../assets/illustrations/characters/intersectional/xp05.webp";
import type { EditorialCharacterIdV2 } from "../../types/editorialV2";

const characterPortraitsV2 = {
  P02: p02Portrait,
  P03: p03Portrait,
  P04: p04Portrait,
  P05: p05Portrait,
  P09: p09Portrait,
  XP01: xp01Portrait,
  XP02: xp02Portrait,
  XP05: xp05Portrait,
} as const satisfies Readonly<Partial<Record<EditorialCharacterIdV2, string>>>;

export function getCharacterPortraitV2(characterId: EditorialCharacterIdV2): string | null {
  return characterPortraitsV2[characterId as keyof typeof characterPortraitsV2] ?? null;
}
