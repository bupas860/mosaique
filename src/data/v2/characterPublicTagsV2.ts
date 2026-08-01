import type { CharacterV2, EditorialCharacterIdV2, IntersectionalCharacterV2 } from "../../types/editorialV2";
import { intersectionalCharactersV2 } from "./allModesRuntimeV2";
import { playableCharactersV2 } from "./runtimeV2";

type PublicTagSourceCharacter = CharacterV2 | IntersectionalCharacterV2;

export function getCharacterPublicTagsFromSource(character: PublicTagSourceCharacter): readonly string[] {
  if ("profile" in character) {
    return character.profile
      .split("—")
      .slice(1)
      .flatMap((part) => part.split("."))
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  const tags = [
    character.genderIdentity,
    character.orientation,
    character.pronouns.length > 0 ? `Pronom : ${character.pronouns.join(", ")}` : undefined,
  ].filter((tag): tag is string => Boolean(tag));
  if (tags.length < 2) {
    const firstPresentationSentence = character.presentation.split(".")[0]?.trim();
    if (firstPresentationSentence) tags.push(firstPresentationSentence);
  }
  return tags.slice(0, 3);
}

const sourceCharactersById = new Map(
  [...playableCharactersV2, ...intersectionalCharactersV2].map((character) => [character.id, character] as const),
);

export function getCharacterPublicTagsV2(characterId: EditorialCharacterIdV2): readonly string[] {
  const character = sourceCharactersById.get(characterId);
  if (!character) throw new Error(`Source des étiquettes publiques absente : ${characterId}`);
  return getCharacterPublicTagsFromSource(character);
}
