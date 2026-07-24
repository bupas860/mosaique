import type { Character } from "../types/character";

interface Props {
  character: Pick<
    Character,
    | "age"
    | "schoolLevel"
    | "genderIdentity"
    | "affectiveAndSexualOrientation"
    | "pronouns"
    | "characteristics"
  >;
  compact?: boolean;
  className?: string;
}

export default function CharacterInformation({
  character,
  compact = false,
  className = "",
}: Props) {
  const pronounLabel = character.pronouns.length > 1 ? "Pronoms" : "Pronom";

  return (
    <div className={`${compact ? "space-y-0.5 text-sm" : "space-y-1 text-sm"} text-slate-700 ${className}`}>
      <p className="font-medium text-slate-600">
        {character.age} ans · {character.schoolLevel}
      </p>
      <p>{character.genderIdentity}</p>
      <p>{character.affectiveAndSexualOrientation}</p>
      {character.pronouns.length > 0 && (
        <p>{pronounLabel} : {character.pronouns.join(", ")}</p>
      )}
      {character.characteristics.map((characteristic) => (
        <p key={characteristic}>{characteristic}</p>
      ))}
    </div>
  );
}
