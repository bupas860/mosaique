import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import { getCharacterPublicTagsV2 } from "../data/v2/characterPublicTagsV2";

interface Props {
  characterId: EditorialCharacterIdV2;
  className?: string;
}

export default function CharacterPublicTags({ characterId, className = "" }: Props) {
  const tags = getCharacterPublicTagsV2(characterId);
  return (
    <ul className={`character-markers ${className}`} aria-label="Caractéristiques publiques du personnage">
      {tags.map((tag) => <li key={tag}>{tag}</li>)}
    </ul>
  );
}
