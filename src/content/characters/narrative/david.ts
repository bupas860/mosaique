import type { NarrativeCharacter } from "../types";

export const david: NarrativeCharacter = {
  id: "david",
  kind: "narrative",
  name: "David",
  profile: {
    pronouns: "il / lui",
    role: "parent",
    presentation: "Père de Noé, David veut avant tout que son fils soit en sécurité. Il apprend peu à peu à parler de ce qu’il ne connaît pas encore.",
    context: "Il apparaît dans les scènes familiales et dans les relations entre familles et établissement.",
  },
  relationshipHints: ["père de Noé"],
};
