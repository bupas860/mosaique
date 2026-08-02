import { publicCharacterTagsV2 } from "../public/characterPublicTagsV2";
import type { EditorialCharacterIdV2 } from "../../types/editorialV2";

export function getCharacterPublicTagsV2(characterId: EditorialCharacterIdV2): readonly string[] {
  return publicCharacterTagsV2[characterId];
}
