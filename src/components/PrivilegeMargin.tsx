import { useState } from "react";

import type { GameCharacterV2 } from "../types/choiceHistory";
import CharacterInformation from "./CharacterInformation";
import CharacterPortrait from "./CharacterPortrait";

interface Props {
  characters: readonly GameCharacterV2[];
  selectedCharacterId?: string;
  totalExperiences: number;
  currentSituation?: number;
  proposedPositions?: Record<string, number>;
  className?: string;
  prominent?: boolean;
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
  currentSituation,
  proposedPositions,
  className = "mb-8",
  prominent = false,
}: Props) {
  const [hoveredProfileId, setHoveredProfileId] = useState<string>();
  const [openProfileId, setOpenProfileId] = useState<string>();
  const visibleProfileId = hoveredProfileId ?? openProfileId;
  const labelInterval = getLabelInterval(totalExperiences);
  const steps = Array.from({ length: totalExperiences + 1 }, (_, index) => index);
  const selectedCharacter = characters.find(({ id }) => id === selectedCharacterId);
  const displayedCharacters = selectedCharacter
    ? [
        selectedCharacter,
        ...characters.filter(({ id }) => id !== selectedCharacterId),
      ]
    : characters;

  return (
    <section
      className={`${className} app-surface privilege-margin rounded-2xl border p-4 sm:p-6 lg:p-8 ${prominent ? "border-slate-400" : "border-slate-300"}`}
      style={{
        "--character-accent": selectedCharacter?.accentColor,
      } as React.CSSProperties}
    >
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Marche des privilèges</h2>
        <p className="mt-2 text-sm text-slate-600">
          Chaque personnage part du même point. Selon les situations rencontrées, il avance d&apos;un pas ou reste sur place.
        </p>
        {proposedPositions && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-700">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-700" />Position issue de vos réponses</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border-2 border-dashed border-slate-700 bg-white" />Position selon l’interprétation proposée</span>
          </div>
        )}
      </header>

      <div className="mb-3 flex justify-between text-sm text-slate-600">
        <span>Position sur la marche</span>
        <span>0 à {totalExperiences} pas possibles</span>
      </div>

      <div className="relative mx-5 mb-6 h-7">
        <div className="absolute top-0 h-2 w-full rounded-full bg-slate-200" />
        {currentSituation !== undefined && (
          <div
            role="img"
            aria-label={"Progression : situation " + currentSituation + " sur " + totalExperiences}
            className="absolute top-[-2.25rem] z-10 flex flex-col items-center text-violet-950"
            style={{
              left: getMarkerPosition(currentSituation, totalExperiences) + "%",
              transform: currentSituation === totalExperiences ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            <span className="whitespace-nowrap rounded-full border border-violet-300 bg-violet-50 px-2 py-1 text-xs font-bold shadow-sm">
              Situation {currentSituation} / {totalExperiences}
            </span>
            <span aria-hidden="true" className="h-9 border-l-2 border-dashed border-violet-600" />
          </div>
        )}
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

      <div className="space-y-3">
        {displayedCharacters.map((character) => {
          const isSelected = character.id === selectedCharacterId;
          const markerPosition = getMarkerPosition(
            character.position,
            totalExperiences,
          );
          const proposedPosition = proposedPositions?.[character.id] ?? 0;
          const proposedMarkerPosition = getMarkerPosition(
            proposedPosition,
            totalExperiences,
          );

          return (
            <div
              key={character.id}
              className={`privilege-row rounded-xl border transition-colors ${
                isSelected
                  ? "privilege-row--selected p-3"
                  : "border-transparent px-3 py-2"
              }`}
              style={{
                borderLeftColor: character.accentColor,
                borderLeftWidth: "4px",
              }}
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold" style={{ color: character.accentColor }}>
                    {character.name}
                  </p>
                  {isSelected && (
                    <span className="selected-character-badge rounded-full border px-2.5 py-1 text-xs font-bold">
                      Personnage incarné
                    </span>
                  )}
                  {isSelected && (
                    <button
                      type="button"
                      className="selected-character-link text-sm font-medium underline underline-offset-2"
                      aria-expanded={visibleProfileId === character.id}
                      onClick={() => setOpenProfileId((current) =>
                        current === character.id ? undefined : character.id
                      )}
                    >
                      {visibleProfileId === character.id ? "Masquer le personnage" : "Voir le personnage"}
                    </button>
                  )}
                </div>
                {proposedPositions ? (
                  <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm text-slate-700">
                    {isSelected && <span><strong>Vos réponses&nbsp;:</strong> {character.position} / {totalExperiences} pas</span>}
                    <span><strong>Interprétation proposée&nbsp;:</strong> {proposedPosition} / {totalExperiences} pas</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700">{character.position} / {totalExperiences} pas</p>
                )}
              </div>

              {isSelected && (
                <CharacterInformation
                  character={character}
                  compact
                  className="selected-character-information mb-4 rounded-lg px-3 py-2"
                />
              )}

              <div
                className={`relative mx-5 mt-3 rounded-full ${
                  isSelected ? "selected-character-track" : "bg-slate-200"
                } ${proposedPositions ? "mb-7 h-4" : "h-4"}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 rounded-full opacity-35"
                  style={{
                    width: `${getMarkerPosition(proposedPositions && !isSelected ? proposedPosition : character.position, totalExperiences)}%`,
                    backgroundColor: character.accentColor,
                  }}
                />
                {isSelected && !proposedPositions && (
                  <div
                    aria-hidden="true"
                    className="selected-character-track__progress absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${markerPosition}%` }}
                  />
                )}
                {(!proposedPositions || isSelected) && <button
                  type="button"
                  aria-label={proposedPositions
                    ? `${character.name}, position issue de vos réponses : ${character.position} pas sur ${totalExperiences}`
                    : `Voir le personnage ${character.name}, ${character.position} pas sur ${totalExperiences}`}
                  aria-expanded={visibleProfileId === character.id}
                  onMouseEnter={() => setHoveredProfileId(character.id)}
                  onMouseLeave={() => setHoveredProfileId(undefined)}
                  onClick={() => setOpenProfileId((current) =>
                    current === character.id ? undefined : character.id
                  )}
                  className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    isSelected
                      ? "selected-character-marker h-10 w-10 border-2 border-white"
                      : "h-8 w-8 border border-slate-400 bg-white"
                  }`}
                  style={{
                    left: `${markerPosition}%`,
                    transform: "translate(-50%, -50%)",
                    borderColor: character.accentColor,
                  }}
                >
                  <CharacterPortrait
                    characterId={character.id}
                    characterName={character.name}
                    image={character.image}
                    accentColor={character.accentColor}
                    size="progress"
                    eager={isSelected}
                    decorative
                    className="h-full w-full"
                  />
                </button>}
                {proposedPositions && (
                  <div
                    role="img"
                    aria-label={`${character.name}, position selon l’interprétation proposée : ${proposedPosition} pas sur ${totalExperiences}`}
                    className="absolute top-full mt-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed bg-white text-xs font-bold"
                    style={{
                      left: `${proposedMarkerPosition}%`,
                      transform: "translateX(-50%)",
                      color: character.accentColor,
                      borderColor: character.accentColor,
                    }}
                  >
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {visibleProfileId === character.id && (
                <aside className="mt-5 flex max-w-2xl flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-lg sm:flex-row">
                  <CharacterPortrait
                    characterId={character.id}
                    characterName={character.name}
                    image={character.image}
                    accentColor={character.accentColor}
                    size="summary"
                    eager={isSelected}
                    className="shrink-0 self-center sm:self-start"
                  />
                  <div>
                    <p className="text-base font-bold text-slate-900">{character.name}</p>
                    <CharacterInformation character={character} className="mt-2" />
                    {"profile" in character && <p className="mt-3 leading-relaxed">{character.profile}</p>}
                  </div>
                </aside>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
