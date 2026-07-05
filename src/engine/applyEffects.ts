import type { Character } from "../types/character";

export interface CharacterEffect {
  characterId: string;
  delta: number;
}

export function applyEffects(
  characters: Character[],
  effects: CharacterEffect[]
): Character[] {
  return characters.map((character) => {
    const effect = effects.find(
      (e) => e.characterId === character.id
    );

    if (!effect) {
      return character;
    }

    return {
      ...character,
      position: character.position + effect.delta,
    };
  });
}
