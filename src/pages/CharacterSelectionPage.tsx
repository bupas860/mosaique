import Button from "../components/Button";
import Screen from "../components/Screen";
import type { Character } from "../types/character";

interface Props {
  characters: Character[];
  onSelect: (characterId: string) => void;
}

export default function CharacterSelectionPage({ characters, onSelect }: Props) {
  return (
    <Screen>
      <main className="w-full max-w-7xl space-y-8 p-4 sm:p-8 lg:p-12">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Qui souhaitez-vous incarner&nbsp;?</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-700">
            Choisissez le personnage dont vous vivrez le parcours et les situations.
          </p>
        </header>

        <div
          aria-label="Personnages à incarner"
          className="flex snap-x gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible"
        >
          {characters.map((character) => (
            <article
              key={character.id}
              className="min-w-[19rem] snap-start rounded-2xl border border-slate-300 bg-white p-6 shadow sm:min-w-[22rem] lg:min-w-0"
            >
              <div className="flex items-center gap-4">
                {character.profile.avatar ? (
                  <img
                    src={character.profile.avatar.src}
                    alt={character.profile.avatar.alt}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
                    style={{ backgroundColor: character.color }}
                  >
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-2xl font-bold">{character.name}</h2>
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-slate-800">{character.profile.presentation}</p>
                <p className="border-l-4 pl-4 text-sm text-slate-600" style={{ borderColor: character.color }}>
                  {character.profile.context}
                </p>
              </div>

              <div className="mt-6">
                <Button onClick={() => onSelect(character.id)}>
                  Incarner ce personnage
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </Screen>
  );
}
