import alternativesJson from "../generated-v2/public-character-alts.json";
import type { EditorialCharacterIdV2 } from "../../types/editorialV2";

const alternatives = alternativesJson as Readonly<Record<EditorialCharacterIdV2, string>>;

export function getCharacterPortraitAltV2(id: EditorialCharacterIdV2): string {
  return alternatives[id];
}
