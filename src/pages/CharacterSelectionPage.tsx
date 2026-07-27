import CharacterInformation from "../components/CharacterInformation";
import CharacterPortrait from "../components/CharacterPortrait";
import Button from "../components/Button";
import Screen from "../components/Screen";
import type { Character } from "../types/character";

interface Props {
  characters: Character[];
  onSelect: (characterId: string) => void;
  onBack: () => void;
}

export default function CharacterSelectionPage({ characters, onSelect, onBack }: Props) {
  return (
    <Screen>
      <main className="w-full max-w-[var(--ds-content-width)] space-y-8 p-4 sm:p-8 lg:p-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Qui souhaitez-vous incarner&nbsp;?</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-700">
            Choisissez le personnage dont vous vivrez le parcours et les situations.
          </p>
        </header>

        <div
          aria-label="Personnages à incarner"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {characters.map((character) => (
            <article
              key={character.id}
              className="character-card interactive-card group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2"
              style={{ "--character-accent": character.color } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => onSelect(character.id)}
                className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus:outline-none"
                aria-label={`Incarner ${character.name}`}
              >
                <span className="sr-only">Incarner {character.name}</span>
              </button>

              <CharacterPortrait
                characterId={character.id}
                characterName={character.name}
                size="card"
                className="w-full border-b border-slate-200"
              />

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h2 className="character-card__name text-2xl font-bold">{character.name}</h2>
                <CharacterInformation
                  character={character}
                  className="character-card__information mt-2 flex-1 border-l-4 pl-4"
                />

                <div className="mt-5">
                  <span
                    aria-hidden="true"
                    className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm transition group-hover:bg-blue-700"
                  >
                    Incarner ce personnage
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center"><Button variant="secondary" onClick={onBack}>Retour au choix du mode</Button></div>
      </main>
    </Screen>
  );
}
