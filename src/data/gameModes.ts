import type { GameMode, GameModeId } from "../types/gameMode";

export const DEFAULT_GAME_MODE_ID: GameModeId = "discovery";

const modes: GameMode[] = [
  { id: "discovery", title: "Découverte", description: "Découvrez, dans une même partie, les obstacles visibles, les normes ordinaires et les effets invisibles.", order: 1, available: true, recommended: true, recommendedLabel: "Recommandé pour découvrir Mosaïque", situationBankId: "discovery" },
  { id: "visible-obstacles", title: "Obstacles visibles", description: "Repérez les paroles, les actes, les refus ou les exclusions directement perceptibles dans la vie scolaire.", order: 2, available: true, situationBankId: "visible-obstacles" },
  { id: "ordinary-norms", title: "Normes ordinaires", description: "Repérez comment des procédures, des catégories ou des organisations habituelles peuvent créer des obstacles sans intention explicite de discriminer.", order: 3, available: true, situationBankId: "ordinary-norms" },
  { id: "invisible-effects", title: "Effets invisibles", description: "Repérez les effets moins visibles de l’invisibilisation, des représentations limitées, de l’anticipation et de l’autocensure.", order: 4, available: true, situationBankId: "invisible-effects" },
  { id: "intersectionalities", title: "Intersectionnalités", description: "Repérez comment plusieurs rapports sociaux se combinent et produisent des obstacles spécifiques, qui ne se réduisent pas à une simple addition.", order: 5, available: true, situationBankId: "intersectionalities" },
];

export const gameModes = [...modes].sort((left, right) => left.order - right.order);
