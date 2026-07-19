import type { NarrativeCharacter } from "../types";

export const lea: NarrativeCharacter = {
  id: "lea",
  kind: "narrative",
  name: "Léa",
  profile: {
    age: 14,
    pronouns: "elle",
    role: "student",
    presentation: "Amie proche de Sami, Léa souhaite le soutenir sans faire de son identité le seul sujet de leur relation.",
    context: "Elle intervient dans des scènes de collège, d’EPS et d’amitié.",
  },
  relationshipHints: ["amie de Sami"],
};
