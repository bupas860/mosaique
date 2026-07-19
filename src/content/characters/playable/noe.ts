import type { PlayableCharacter } from "../types";

export const noe: PlayableCharacter = {
  id: "noe",
  kind: "playable",
  name: "Noé",
  color: "#0f766e",
  position: 0,
  profile: {
    age: 15,
    pronouns: "il / lui",
    role: "student",
    identityLabels: ["homme gay"],
    narrativeFocus: ["adolescence", "milieu rural", "football", "visibilité"],
    presentation:
      "Élève de seconde dans un lycée rural, Noé aime le football et les moments simples avec son groupe d’amis.",
    context:
      "Son parcours explore la place d’un jeune homme gay entre lycée, sport et vie de village.",
  },
};
