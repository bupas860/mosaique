import type { PlayableCharacter } from "../types";

export const nadia: PlayableCharacter = {
  id: "nadia",
  kind: "playable",
  name: "Nadia",
  color: "#9333ea",
  position: 0,
  profile: {
    age: 42,
    pronouns: "elle",
    role: "teacher",
    identityLabels: ["femme trans"],
    narrativeFocus: ["transidentité", "racisation", "autorité professionnelle", "familles"],
    presentation:
      "Professeure de lettres, Nadia arrive dans un nouvel établissement avec une solide expérience de l’enseignement et le désir de s’inscrire dans une nouvelle équipe.",
    context:
      "Son parcours traite de légitimité professionnelle, d’institutions et de relations avec les familles, sans faire du passing un indicateur de valeur.",
  },
};
