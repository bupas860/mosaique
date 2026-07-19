import type { PlayableCharacter } from "../types";

export const ines: PlayableCharacter = {
  id: "ines",
  kind: "playable",
  name: "Inès",
  color: "#7c3aed",
  position: 0,
  profile: {
    age: 16,
    pronouns: "elle",
    role: "student",
    identityLabels: ["femme bisexuelle"],
    narrativeFocus: ["bisexualité", "milieu populaire", "vie urbaine", "relations entre pairs"],
    presentation:
      "Inès est en première dans un lycée urbain. Elle apprécie les sorties avec ses amis et garde un regard très lucide sur les étiquettes que les autres lui attribuent.",
    context:
      "Son parcours aborde l’effacement de la bisexualité, les présomptions et les ressources d’une vie sociale riche.",
  },
};
