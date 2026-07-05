import type { Character } from "../types/character";
import type { CharacterEffect } from "../types/situation";

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

    const nextPosition = Math.min(
      100,
      Math.max(0, character.position + effect.displacement)
    );

    return {
      ...character,
      position: nextPosition,
    };
  });
}
