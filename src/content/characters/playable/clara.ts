import type { PlayableCharacter } from "../types";

export const clara: PlayableCharacter = {
  id: "clara",
  kind: "playable",
  name: "Clara",
  color: "#db2777",
  position: 0,
  profile: {
    age: 15,
    pronouns: "elle",
    role: "student",
    identityLabels: ["personne intersexe"],
    narrativeFocus: ["intersexuation", "intimité", "natation", "santé"],
    presentation:
      "Clara est en seconde et nage en club. Elle tient à ce que ses goûts, ses amitiés et ses projets comptent davantage que son histoire médicale.",
    context:
      "Son parcours aborde l’intimité, le contrôle de son récit personnel et les enjeux du sport sans la réduire à son corps.",
  },
};
