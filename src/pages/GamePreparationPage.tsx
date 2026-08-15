import AppBackground from "../components/AppBackground";
import Button from "../components/Button";
import CharacterPortrait from "../components/CharacterPortrait";
import CharacterPublicTags from "../components/CharacterPublicTags";
import { gameModes } from "../data/gameModes";
import summariesJson from "../data/public/publicCharacterSummaries.generated.json";
import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { GameModeId } from "../types/gameMode";
import type { ActivePlayableCharacterV2 } from "../types/runtimeV2";
import { characterBiographyHash } from "../utils/appRoute";

interface Props {
  selectedModeId: GameModeId;
  selectedCharacterId?: EditorialCharacterIdV2;
  characters: readonly ActivePlayableCharacterV2[];
  onSelectMode: (id: GameModeId) => void;
  onSelectCharacter: (id: EditorialCharacterIdV2) => void;
  onStart: () => void;
}

export default function GamePreparationPage({ selectedModeId, selectedCharacterId, characters, onSelectMode, onSelectCharacter, onStart }: Props) {
  const selectedCharacter = characters.find(({ id }) => id === selectedCharacterId);
  const selectedSummary = summariesJson.summaries.find(({ id }) => id === selectedCharacterId);
  return <AppBackground as="main" className="game-preparation">
    <div className="game-preparation__inner">
      <header><p><a href="#/" className="app-text-link">Retour à l’accueil</a></p><h1>Préparer votre partie</h1></header>
      <section aria-labelledby="game-mode-title"><h2 id="game-mode-title">1. Choisissez un mode</h2>
        <fieldset><legend className="sr-only">Mode de jeu</legend><div className="game-preparation__modes">{gameModes.map((mode) => {
          const selected = mode.id === selectedModeId;
          return <label key={mode.id} className={`game-preparation__mode${selected ? " game-preparation__mode--selected" : ""}${mode.available ? "" : " game-preparation__mode--unavailable"}`}><input type="radio" name="game-mode" value={mode.id} checked={selected} disabled={!mode.available} onChange={() => onSelectMode(mode.id)} /><span><strong>{mode.title}</strong><small>{mode.description}</small>{mode.recommended ? <em>★ Recommandé pour découvrir la marche des privilèges</em> : null}{selected ? <b>✓ Sélectionné</b> : null}{!mode.available ? <b>Indisponible</b> : null}</span></label>;
        })}</div></fieldset>
      </section>
      <section aria-labelledby="game-character-title"><h2 id="game-character-title">2. Choisissez votre personnage</h2><p>Choisissez le personnage dont vous vivrez le parcours et les situations.</p>
        <div className="game-preparation__character-layout"><fieldset><legend className="sr-only">Personnage incarné</legend><div className="game-preparation__characters">{characters.map((character) => {
          const selected = character.id === selectedCharacterId;
          return <label key={character.id} className={`game-preparation__character${selected ? " game-preparation__character--selected" : ""}`} style={{ "--character-accent": character.accentColor } as React.CSSProperties}><input type="radio" name="game-character" value={character.id} checked={selected} onChange={() => onSelectCharacter(character.id)} /><CharacterPortrait characterId={character.id} characterName={character.name} image={character.image} accentColor={character.accentColor} size="card" decorative /><span><strong>{character.name}</strong><small>{character.age} ans · {character.schoolLevel}</small><CharacterPublicTags characterId={character.id} /><b>{selected ? "✓ Personnage sélectionné" : "Sélectionner"}</b></span></label>;
        })}</div></fieldset>{selectedCharacter && selectedSummary ? <aside className="game-preparation__selected-character" aria-live="polite" aria-atomic="true"><h3>Personnage sélectionné</h3><div className="game-preparation__selected-profile"><CharacterPortrait characterId={selectedCharacter.id} characterName={selectedCharacter.name} image={selectedCharacter.image} accentColor={selectedCharacter.accentColor} size="summary" /><div><p className="game-preparation__selected-name">{selectedCharacter.name}</p><p>{selectedCharacter.age} ans · {selectedCharacter.schoolLevel}</p><CharacterPublicTags characterId={selectedCharacter.id} /></div></div><p>{selectedSummary.shortDescription}</p><a className="app-text-link" href={characterBiographyHash(selectedCharacter.id, { type: "game-preparation" })}>Découvrir son parcours</a></aside> : null}</div>
      </section>
      <div className="game-preparation__action"><Button onClick={onStart} disabled={!selectedCharacterId}>Commencer la partie</Button></div>
    </div>
  </AppBackground>;
}
