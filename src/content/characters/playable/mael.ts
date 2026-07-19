import type { PlayableCharacter } from "../types";

export const mael: PlayableCharacter = {
  id: "mael",
  kind: "playable",
  name: "Maël",
  color: "#b45309",
  position: 0,
  profile: {
    age: 17,
    pronouns: "iel",
    role: "student",
    identityLabels: ["personne non binaire"],
    narrativeFocus: ["non-binarité", "racisation", "vie lycéenne", "expression artistique"],
    presentation:
      "En terminale, Maël s’investit dans un club artistique et dans la vie de son lycée. Iel est entouré·e, sans pour autant trouver tous les espaces également accueillants.",
    context:
      "Son parcours explore les normes de genre, la prise de parole et les effets situés de la racisation.",
  },
};
