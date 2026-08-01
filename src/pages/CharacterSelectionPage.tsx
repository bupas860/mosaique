import { useEffect, useRef, useState } from "react";
import CharacterDetailDialog from "../components/CharacterDetailDialog";
import CharacterPortrait from "../components/CharacterPortrait";
import CharacterPublicTags from "../components/CharacterPublicTags";
import Button from "../components/Button";
import Screen from "../components/Screen";
import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { ActivePlayableCharacterV2 } from "../types/runtimeV2";

interface Props { characters: readonly ActivePlayableCharacterV2[]; onSelect: (characterId: EditorialCharacterIdV2) => void; onBack: () => void; }

export default function CharacterSelectionPage({ characters, onSelect, onBack }: Props) {
  const [detailedCharacterId, setDetailedCharacterId] = useState<EditorialCharacterIdV2>();
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const detailedCharacter = characters.find(({ id }) => id === detailedCharacterId);
  const isIntersectionalGallery = characters.every(({ id }) => id.startsWith("XP"));

  useEffect(() => {
    setDetailedCharacterId(undefined);
    openerRef.current = null;
  }, [characters]);

  function openDetails(characterId: EditorialCharacterIdV2, opener: HTMLButtonElement) {
    openerRef.current = opener;
    setDetailedCharacterId(characterId);
  }

  function closeDetails() {
    setDetailedCharacterId(undefined);
    requestAnimationFrame(() => openerRef.current?.focus());
  }

  return <Screen><main className="w-full max-w-[var(--ds-content-width)] space-y-8 p-4 sm:p-8 lg:p-12">
    <header className="space-y-3 text-center"><h1 className="text-4xl font-bold sm:text-5xl">Qui souhaitez-vous incarner&nbsp;?</h1><p className="mx-auto max-w-2xl text-lg text-slate-700">Choisissez le personnage dont vous vivrez le parcours et les situations.</p></header>
    <div aria-label="Personnages à découvrir" className={`character-gallery ${isIntersectionalGallery ? "character-gallery--intersectional" : "character-gallery--general"}`}>
      {characters.map((character) => {
        return <article key={character.id} className="character-compact-card interactive-card" style={{ "--character-accent": character.accentColor } as React.CSSProperties}>
          <button
            type="button"
            onClick={(event) => openDetails(character.id, event.currentTarget)}
            className="character-compact-card__button"
            aria-label={`Découvrir ${character.name}`}
          ><span className="sr-only">Découvrir {character.name}</span></button>
          <CharacterPortrait characterId={character.id} characterName={character.name} image={character.image} accentColor={character.accentColor} size="card" decorative className="character-compact-card__portrait" />
          <div className="character-compact-card__content">
            <h2 className="character-compact-card__name">{character.name}</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">{character.age} ans · {character.schoolLevel}</p>
            <CharacterPublicTags characterId={character.id} className="mt-3" />
            <span aria-hidden="true" className="character-compact-card__action">Découvrir ce personnage</span>
          </div>
        </article>;
      })}
    </div>
    <div className="text-center"><Button variant="secondary" onClick={onBack}>Retour au choix du mode</Button></div>
    {detailedCharacter && <CharacterDetailDialog character={detailedCharacter} onChoose={() => onSelect(detailedCharacter.id)} onClose={closeDetails} />}
  </main></Screen>;
}
