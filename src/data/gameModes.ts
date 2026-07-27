import type { GameMode, GameModeId } from "../types/gameMode";

export const DEFAULT_GAME_MODE_ID: GameModeId = "discovery";
const modes: GameMode[] = [
  { id: "discovery", title: "Découverte", description: "Découvrez différentes formes d’obstacles rencontrées dans la vie scolaire : comportements visibles, normes ordinaires et effets plus difficiles à percevoir.", order: 1, available: true, recommended: true },
  { id: "visible-obstacles", title: "Obstacles visibles", description: "Repérez les paroles, les actes, les refus ou les exclusions directement perceptibles dans la vie scolaire.", order: 2, available: false },
  { id: "ordinary-norms", title: "Normes ordinaires", description: "Observez comment des règles, des catégories et des habitudes apparemment neutres peuvent produire des effets différents selon les élèves.", order: 3, available: false },
  { id: "invisible-effects", title: "Effets invisibles", description: "Analysez les absences, les représentations et les bonnes intentions qui peuvent créer un malaise ou une exclusion sans discrimination explicite.", order: 4, available: false },
  { id: "intersectionalities", title: "Intersectionnalités", description: "Découvrez comment plusieurs rapports sociaux peuvent interagir et produire une expérience particulière, qui ne correspond pas à la simple addition de deux discriminations.", order: 5, available: false },
]

export const gameModes = modes.sort((a, b) => a.order - b.order);
