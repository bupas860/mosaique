import type { Character } from "../types/character";

interface Props {
  characters: Character[];
}

const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

export default function PrivilegeMargin({ characters }: Props) {
  return (
    <section className="mb-8 rounded-xl border border-slate-300 bg-white p-6 shadow">

      <h2 className="mb-6 text-center text-2xl font-bold">
        Marge des privilèges
      </h2>

      <div className="mb-2 flex justify-between text-sm text-slate-600">
        <span>Moins de privilèges</span>
        <span>Plus de privilèges</span>
      </div>

      <div className="relative mb-10">
        <div className="h-2 rounded-full bg-gradient-to-r from-red-300 via-yellow-200 to-green-300" />

        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute top-0"
            style={{
              left: `${tick}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="h-4 w-px bg-slate-500" />
            <div className="mt-1 text-xs text-slate-500">
              {tick}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">

        {characters.map((character) => (
          <div key={character.id}>

            <div className="mb-2 font-semibold">
              {character.name}
            </div>

            <div className="relative h-4 rounded-full bg-slate-200">

              <div
                className="absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-sm font-bold text-white shadow-lg transition-all duration-700"
                style={{
                  left: `calc(${character.position}% - 18px)`,
                  backgroundColor: character.color,
                }}
              >
                {character.name.charAt(0).toUpperCase()}
              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}
