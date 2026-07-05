import type { Situation } from "../types/situation";

export const situations: Situation[] = [
  {
    id: 1,
    title: "La marge des privilèges",
    description:
      "En réunion, une personne est constamment interrompue alors qu'elle tente d'expliquer son idée.",
    choices: [
      {
        text: "Ne rien dire",
        feedback:
          "Ne pas intervenir laisse la situation se reproduire sans remise en question."
      },
      {
        text: "Redonner la parole à cette personne",
        feedback:
          "Bonne réaction. Permettre à chacun de s'exprimer favorise une discussion plus équitable."
      }
    ]
  },
  {
    id: 2,
    title: "Une remarque déplacée",
    description:
      "Un collègue fait une blague stéréotypée devant tout le monde.",
    choices: [
      {
        text: "Rire avec le groupe",
        feedback:
          "Le rire peut être interprété comme une validation implicite de la remarque."
      },
      {
        text: "Exprimer calmement son désaccord",
        feedback:
          "Exprimer son désaccord contribue à créer un climat plus respectueux."
      }
    ]
  }
];
