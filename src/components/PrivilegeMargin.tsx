import type { Character } from "../types/character";

interface Props {
  characters: Character[];
}

export default function PrivilegeMargin({ characters }: Props) {
  return (
    <section className="mb-8 rounded-xl border bg-white p-6 shadow">

      <h2 className="mb-6 text-xl font-bold">
        Marge des privilèges
      </h2>

      <div className="mb-2 flex justify-between text-sm text-gray-500">
        <span>Moins de privilèges</span>
        <span>Plus de privilèges</span>
      </div>

      {characters.map((character) => (
        <div
          key={character.id}
          className="mb-6"
        >
          <div className="mb-1 font-medium">
            {character.name}
          </div>

          <div className="relative h-3 rounded-full bg-gray-200">

            <div
              className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-500"
              style={{
                left: `calc(${character.position}% - 10px)`,
              }}
            />

          </div>
        </div>
      ))}

    </section>
  );
}
