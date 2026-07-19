import { useState } from "react";

import type { Character } from "../types/character";

interface Props {
  characters: Character[];
  selectedCharacterId?: string;
  totalExperiences: number;
  realPositions?: Record<string, number>;
}

function getMarkerPosition(steps: number, totalExperiences: number) {
  if (totalExperiences === 0) {
    return 0;
  }

  return Math.max(0, (steps / totalExperiences) * 100);
}

function getLabelInterval(totalExperiences: number) {
  return Math.max(1, Math.ceil(totalExperiences / 10));
}

export default function PrivilegeMargin({
  characters,
  selectedCharacterId,
  totalExperiences,
  realPositions,
}: Props) {
  const [hoveredProfileId, setHoveredProfileId] = useState<string>();
  const [openProfileId, setOpenProfileId] = useState<string>();
  const visibleProfileId = hoveredProfileId ?? openProfileId;
  const labelInterval = getLabelInterval(totalExperiences);
  const steps = Array.from({ length: totalExperiences + 1 }, (_, index) => index);

  return (
    <section className="mb-8 rounded-2xl border border-slate-300 bg-white p-4 shadow sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h2 className="text-2xl font-bold">Marge des privilèges</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chaque expérience permet à un personnage d&apos;avancer d&apos;un pas, ou de rester sur place.
        </p>
        {realPositions && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-700">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-700" />Position selon vos réponses</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border-2 border-dashed border-slate-700 opacity-60" />Position réelle selon les situations</span>
          </div>
        )}
      </header>

      <div className="mb-3 flex justify-between text-sm text-slate-600">
        <span>0 pas</span>
        <span>{totalExperiences} expérience{totalExperiences > 1 ? "s" : ""}</span>
      </div>

      <div className="relative mx-5 mb-8 h-7">
        <div className="absolute top-0 h-2 w-full rounded-full bg-slate-200" />
        {steps.map((step) => {
          const isLabelVisible = step === 0 ||
            step === totalExperiences ||
            step % labelInterval === 0;

          return (
            <div
              key={step}
              className="absolute top-0 text-center"
              style={{
                left: `${getMarkerPosition(step, totalExperiences)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="mx-auto h-4 w-px bg-slate-500" />
              {isLabelVisible && (
                <div className="mt-1 text-xs text-slate-500">{step}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-5">
        {characters.map((character) => {
          const isSelected = character.id === selectedCharacterId;
          const markerPosition = getMarkerPosition(
            character.position,
            totalExperiences,
          );
          const realMarkerPosition = getMarkerPosition(
            realPositions?.[character.id] ?? 0,
            totalExperiences,
          );

          return (
            <div
              key={character.id}
              className={`rounded-xl p-3 transition-colors ${isSelected ? "bg-slate-100" : ""}`}
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="font-semibold">
                    {character.name}{isSelected ? " (personnage incarné)" : ""}
                  </p>
                  {isSelected && (
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-700 underline underline-offset-2"
                      aria-expanded={visibleProfileId === character.id}
                      onClick={() => setOpenProfileId((current) =>
                        current === character.id ? undefined : character.id
                      )}
                    >
                      {visibleProfileId === character.id ? "Masquer le personnage" : "Voir le personnage"}
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-700">
                  {character.position} / {totalExperiences} pas
                </p>
              </div>

              <div className={`relative mx-5 rounded-full bg-slate-200 ${realPositions ? "mb-7 h-4" : "h-4"}`}>
                <button
                  type="button"
                  aria-label={`Voir le personnage ${character.name}, ${character.position} pas sur ${totalExperiences}`}
                  aria-expanded={visibleProfileId === character.id}
                  onMouseEnter={() => setHoveredProfileId(character.id)}
                  onMouseLeave={() => setHoveredProfileId(undefined)}
                  onClick={() => setOpenProfileId((current) =>
                    current === character.id ? undefined : character.id
                  )}
                  className={`absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-sm font-bold text-white shadow-lg transition-all duration-700 ${isSelected ? "ring-4 ring-slate-900 ring-offset-2" : ""}`}
                  style={{
                    left: `${markerPosition}%`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: character.color,
                  }}
                >
                  {character.name.charAt(0).toUpperCase()}
                </button>
                {realPositions && isSelected && (
                  <div
                    aria-label={`${character.name}, position réelle selon les situations : ${realPositions[character.id] ?? 0} pas sur ${totalExperiences}`}
                    className="absolute top-full mt-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-slate-700 bg-white text-xs font-bold opacity-60"
                    style={{
                      left: `${realMarkerPosition}%`,
                      transform: "translateX(-50%)",
                      color: character.color,
                    }}
                  >
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {visibleProfileId === character.id && (
                <aside className="mt-5 max-w-2xl rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-lg">
                  <p className="text-base font-bold text-slate-900">{character.name}</p>
                  <p className="mt-1">
                    {[character.profile.age && `${character.profile.age} ans`, character.profile.schoolLevel, character.profile.identity]
                      .filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-2">{character.profile.context}</p>
                  {character.profile.traits && (
                    <p className="mt-2"><strong>Caractéristiques principales :</strong> {character.profile.traits.join(", ")}</p>
                  )}
                  {character.profile.protectiveFactors && (
                    <p className="mt-2"><strong>Ce qui peut faciliter sa participation :</strong> {character.profile.protectiveFactors.join(", ")}</p>
                  )}
                </aside>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
