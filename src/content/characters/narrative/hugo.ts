import type { NarrativeCharacter } from "../types";

export const hugo: NarrativeCharacter = {
  id: "hugo",
  kind: "narrative",
  name: "Hugo",
  profile: {
    age: 15,
    pronouns: "il / lui",
    role: "student",
    presentation: "Coéquipier de football de Noé, Hugo suit souvent le mouvement du groupe avant de réfléchir aux conséquences de certaines plaisanteries.",
    context: "Il permet d’explorer le rôle des témoins dans les espaces sportifs et scolaires.",
  },
  relationshipHints: ["coéquipier de Noé"],
};
