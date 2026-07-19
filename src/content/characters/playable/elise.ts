import type { PlayableCharacter } from "../types";

export const elise: PlayableCharacter = {
  id: "elise",
  kind: "playable",
  name: "Élise",
  color: "#be123c",
  position: 0,
  profile: {
    age: 39,
    pronouns: "elle",
    role: "teacher",
    identityLabels: ["femme lesbienne"],
    narrativeFocus: ["lesbianité", "salle des professeurs", "visibilité", "milieu rural"],
    presentation:
      "Professeure d’histoire-géographie, Élise est une enseignante expérimentée, attentive à ses élèves et à la place de chacun·e dans la classe.",
    context:
      "Son parcours interroge la visibilité des femmes lesbiennes, les relations professionnelles et les liens entre établissement et familles.",
  },
};
