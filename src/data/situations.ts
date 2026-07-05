import type { Situation } from "../types/game";

export const situations: Situation[] = [
  {
    id: "intro",
    title: "Première situation",
    text:
      "Vous arrivez dans une nouvelle entreprise. Deux collègues discutent et l'un d'eux vous demande votre avis.",
    choices: [
      {
        id: "a",
        label: "Je réponds immédiatement.",
        feedback:
          "Vous choisissez de prendre la parole sans attendre.",
      },
      {
        id: "b",
        label: "J'observe avant de parler.",
        feedback:
          "Vous préférez comprendre le contexte avant d'intervenir.",
      },
    ],
  },
  {
    id: "meeting",
    title: "Deuxième situation",
    text:
      "Lors d'une réunion, une personne est régulièrement interrompue.",
    choices: [
      {
        id: "a",
        label: "Je laisse la discussion continuer.",
        feedback:
          "Vous choisissez de ne pas intervenir.",
      },
      {
        id: "b",
        label: "Je propose de laisser cette personne terminer.",
        feedback:
          "Vous intervenez pour rééquilibrer la parole.",
      },
    ],
  },
];
