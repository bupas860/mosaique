import biographiesJson from "../public/publicCharacters.generated.json";
import type { EditorialCharacterIdV2 } from "../../types/editorialV2";
import type { PublicBiography } from "../../types/publicBiography";
import { getCharacterPortraitV2 } from "./characterPortraitsV2";

const expectedIds: readonly EditorialCharacterIdV2[] = [
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09",
  "XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08",
];

const biographies = biographiesJson.biographies as readonly PublicBiography[];
if (biographies.length !== expectedIds.length || biographies.some(({ id }, index) => id !== expectedIds[index])) {
  throw new Error("Biographies publiques : catalogue incomplet ou mal ordonné");
}

export interface RuntimePublicBiography extends PublicBiography {
  readonly image: string;
}

export const publicBiographiesV2: readonly RuntimePublicBiography[] = Object.freeze(
  biographies.map((biography) => Object.freeze({ ...biography, image: getCharacterPortraitV2(biography.portraitId) })),
);

export const publicBiographiesV2ById: Readonly<Record<EditorialCharacterIdV2, RuntimePublicBiography>> =
  Object.fromEntries(publicBiographiesV2.map((biography) => [biography.id, biography])) as Record<EditorialCharacterIdV2, RuntimePublicBiography>;

export function getPublicBiographyV2(id: EditorialCharacterIdV2): RuntimePublicBiography {
  return publicBiographiesV2ById[id];
}

export function getCharacterPortraitAltV2(id: EditorialCharacterIdV2): string {
  return publicBiographiesV2ById[id].portraitAlt;
}
