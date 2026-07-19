import type { PlayableCharacter } from "../types";

export const sami: PlayableCharacter = {
  id: "sami",
  kind: "playable",
  name: "Sami",
  color: "#2563eb",
  position: 0,
  profile: {
    age: 14,
    pronouns: "il / lui",
    role: "student",
    identityLabels: ["homme trans"],
    narrativeFocus: ["transidentité", "surdité", "collège", "basket", "EPS"],
    presentation:
      "Sami est en troisième. Il pratique le basket et connaît bien son collège, où il a construit des liens solides.",
    context:
      "Son parcours croise adolescence, transidentité, déficience auditive et règles concrètes de la vie scolaire et sportive.",
  },
};
