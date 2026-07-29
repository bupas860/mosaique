import p01Portrait from "../../assets/illustrations/characters/general/p01.webp";
import p02Portrait from "../../assets/illustrations/characters/general/p02.webp";
import p03Portrait from "../../assets/illustrations/characters/general/p03.webp";
import p04Portrait from "../../assets/illustrations/characters/general/p04.webp";
import p05Portrait from "../../assets/illustrations/characters/general/p05.webp";
import p06Portrait from "../../assets/illustrations/characters/general/p06.webp";
import p07Portrait from "../../assets/illustrations/characters/general/p07.webp";
import p08Portrait from "../../assets/illustrations/characters/general/p08.webp";
import p09Portrait from "../../assets/illustrations/characters/general/p09.webp";
import xp01Portrait from "../../assets/illustrations/characters/intersectional/xp01.webp";
import xp02Portrait from "../../assets/illustrations/characters/intersectional/xp02.webp";
import xp03Portrait from "../../assets/illustrations/characters/intersectional/xp03.webp";
import xp04Portrait from "../../assets/illustrations/characters/intersectional/xp04.webp";
import xp05Portrait from "../../assets/illustrations/characters/intersectional/xp05.webp";
import xp06Portrait from "../../assets/illustrations/characters/intersectional/xp06.webp";
import xp07Portrait from "../../assets/illustrations/characters/intersectional/xp07.webp";
import xp08Portrait from "../../assets/illustrations/characters/intersectional/xp08.webp";
import type { EditorialCharacterIdV2 } from "../../types/editorialV2";

const characterPortraitsV2 = {
  P01: p01Portrait,
  P02: p02Portrait,
  P03: p03Portrait,
  P04: p04Portrait,
  P05: p05Portrait,
  P06: p06Portrait,
  P07: p07Portrait,
  P08: p08Portrait,
  P09: p09Portrait,
  XP01: xp01Portrait,
  XP02: xp02Portrait,
  XP03: xp03Portrait,
  XP04: xp04Portrait,
  XP05: xp05Portrait,
  XP06: xp06Portrait,
  XP07: xp07Portrait,
  XP08: xp08Portrait,
} as const satisfies Readonly<Record<EditorialCharacterIdV2, string>>;

export function getCharacterPortraitV2(characterId: EditorialCharacterIdV2): string {
  return characterPortraitsV2[characterId];
}
