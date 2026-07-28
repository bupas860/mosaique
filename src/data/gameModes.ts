import type { GameMode, GameModeId } from "../types/gameMode";

export const DEFAULT_GAME_MODE_ID: GameModeId = "visible-obstacles";

const modes: GameMode[] = [
  { id: "discovery", title: "Découverte", description: "Découvrez différentes formes d’obstacles rencontrées dans la vie scolaire : comportements visibles, normes ordinaires et effets plus difficiles à percevoir.", order: 1, available: false },
  { id: "visible-obstacles", title: "Obstacles visibles", description: "Repérez les paroles, les actes, les refus ou les exclusions directement perceptibles dans la vie scolaire.", order: 2, available: true, recommended: true, situationBankId: "visible-obstacles" },
  { id: "ordinary-norms", title: "Normes ordinaires", description: "Repérez comment des procédures, des catégories ou des organisations habituelles peuvent créer des obstacles sans intention explicite de discriminer.", order: 3, available: true, situationBankId: "ordinary-norms" },
  { id: "invisible-effects", title: "Effets invisibles", description: "Repérez les effets moins visibles de l’invisibilisation, des représentations limitées, de l’anticipation et de l’autocensure.", order: 4, available: true, situationBankId: "invisible-effects" },
  { id: "intersectionalities", title: "Intersectionnalités", description: "Repérez comment plusieurs rapports sociaux se combinent et produisent des obstacles spécifiques, qui ne se réduisent pas à une simple addition.", order: 5, available: true, situationBankId: "intersectionalities" },
];

export const gameModes = [...modes].sort((left, right) => left.order - right.order);
