import type { PlayableCharacterV2 } from "../types/runtimeV2";

interface Props {
  character: Pick<PlayableCharacterV2, "age" | "schoolLevel" | "genderIdentity" | "orientation" | "pronouns">;
  compact?: boolean;
  className?: string;
}

export default function CharacterInformation({ character, compact = false, className = "" }: Props) {
  const pronounLabel = character.pronouns.length > 1 ? "Pronoms" : "Pronom";
  return (
    <div className={`${compact ? "space-y-0.5 text-sm" : "space-y-1 text-sm"} text-slate-700 ${className}`}>
      <p className="font-medium text-slate-600">{character.age} ans · {character.schoolLevel}</p>
      <p>{character.genderIdentity}</p>
      {character.orientation && <p>{character.orientation}</p>}
      {character.pronouns.length > 0 && <p>{pronounLabel} : {character.pronouns.join(", ")}</p>}
    </div>
  );
}
