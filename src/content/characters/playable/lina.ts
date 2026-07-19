import type { PlayableCharacter } from "../types";

export const lina: PlayableCharacter = {
  id: "lina",
  kind: "playable",
  name: "Lina",
  color: "#0891b2",
  position: 0,
  profile: {
    age: 36,
    pronouns: "elle",
    role: "education-staff",
    identityLabels: ["femme asexuelle"],
    narrativeFocus: ["asexualité", "vie affective", "accompagnement", "normes relationnelles"],
    presentation:
      "Conseillère principale d’éducation, Lina connaît très bien la vie de son établissement et les élèves qui viennent lui parler.",
    context:
      "Son parcours rend visible l’asexualité et questionne les normes amoureuses et sexuelles dans les récits scolaires et professionnels.",
  },
};
