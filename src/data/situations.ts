import type { Situation } from "../types/situation";

export const situations: Situation[] = [
  {
    id: 1,
    title: "La marge des privilèges",
    description:
      "En réunion, une personne est régulièrement interrompue.",

    choices: [
      {
        text: "Ne rien dire",

        feedback:
          "La situation continue sans être remise en question.",

        effects: [
          {
            characterId: "alex",
            displacement: -8
          }
        ]
      },

      {
        text: "Redonner la parole",

        feedback:
          "Le groupe prend conscience du problème.",

        effects: [
          {
            characterId: "alex",
            displacement: 8
          }
        ]
      }
    ]
  },

  {
    id: 2,
    title: "Une remarque déplacée",

    description:
      "Une plaisanterie stéréotypée est faite devant toute l'équipe.",

    choices: [
      {
        text: "Laisser passer",

        feedback:
          "Les stéréotypes restent banalisés.",

        effects: [
          {
            characterId: "sam",
            displacement: -6
          }
        ]
      },

      {
        text: "Exprimer calmement son désaccord",

        feedback:
          "Le cadre de respect est réaffirmé.",

        effects: [
          {
            characterId: "sam",
            displacement: 6
          }
        ]
      }
    ]
  }
];
