import type {
  Choice,
  ChoiceContent,
  ContentByCharacter,
  Situation,
  SituationContent,
} from "../types/situation";

export function getSituationsForCharacter(
  situations: Situation[],
  characterId: string,
): Situation[] {
  return situations.filter(
    (situation) =>
      situation.availableFor === undefined ||
      situation.availableFor.includes(characterId),
  );
}

export function resolveCharacterContent<T>(
  content: ContentByCharacter<T>,
  characterId: string,
): T {
  return content[characterId] ?? content.common;
}

export function getSituationContent(
  situation: Situation,
  characterId: string,
): SituationContent {
  return resolveCharacterContent(situation.content, characterId);
}

export function getChoiceContent(
  choice: Choice,
  characterId: string,
): ChoiceContent {
  return resolveCharacterContent(choice.content, characterId);
}
