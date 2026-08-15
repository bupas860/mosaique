import type { ChoiceHistoryEntryV2, GameCharacterV2 } from "../types/choiceHistory";
import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { GameModeId } from "../types/gameMode";
import type { RuntimeGameSetV2 } from "../types/runtimeV2";

export type GamePhase = "question" | "feedback" | "end";

export interface ActiveGameSnapshot {
  readonly gameSet: RuntimeGameSetV2;
  readonly selectedCharacterId: EditorialCharacterIdV2;
  readonly selectedModeId: GameModeId;
  readonly currentIndex: number;
  readonly phase: GamePhase;
  readonly choiceHistory: readonly ChoiceHistoryEntryV2[];
  readonly characters: readonly GameCharacterV2[];
  readonly detailsOpen: boolean;
}

interface GameSessionV1 {
  readonly version: 1;
  readonly preparation: {
    readonly modeId: GameModeId;
    readonly characterId?: EditorialCharacterIdV2;
  };
  readonly active?: ActiveGameSnapshot;
}

const STORAGE_KEY = "mosaique.game-session.v1";
const GAME_MODES = new Set<GameModeId>(["discovery", "visible-obstacles", "ordinary-norms", "invisible-effects", "intersectionalities"]);
const PHASES = new Set<GamePhase>(["question", "feedback", "end"]);
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isCharacterId = (value: unknown): value is EditorialCharacterIdV2 => typeof value === "string" && /^(?:P\d{2}|XP\d{2})$/.test(value);
const isModeId = (value: unknown): value is GameModeId => typeof value === "string" && GAME_MODES.has(value as GameModeId);

function isValidActiveGame(value: unknown): value is ActiveGameSnapshot {
  if (!isObject(value) || !isModeId(value.selectedModeId) || !isCharacterId(value.selectedCharacterId)) return false;
  if (!Number.isInteger(value.currentIndex) || (value.currentIndex as number) < 0 || (value.currentIndex as number) > 9) return false;
  if (typeof value.phase !== "string" || !PHASES.has(value.phase as GamePhase) || typeof value.detailsOpen !== "boolean") return false;
  if (!isObject(value.gameSet) || value.gameSet.modeId !== value.selectedModeId || value.gameSet.characterId !== value.selectedCharacterId) return false;
  const situationIds = value.gameSet.situationIds;
  const situations = value.gameSet.situations;
  if (!Array.isArray(situationIds) || !Array.isArray(situations) || situationIds.length !== 10 || situations.length !== 10) return false;
  if (new Set(situationIds).size !== 10 || !situations.every((situation, index) => isObject(situation) && situation.id === situationIds[index])) return false;
  if (!Array.isArray(value.choiceHistory) || !Array.isArray(value.characters) || value.characters.length === 0) return false;
  if (!value.characters.every((character) => isObject(character) && isCharacterId(character.id) && Number.isInteger(character.position))) return false;
  const expectedHistoryLength = value.phase === "question" ? value.currentIndex : value.phase === "feedback" ? (value.currentIndex as number) + 1 : 10;
  if (value.choiceHistory.length !== expectedHistoryLength) return false;
  return value.choiceHistory.every((entry, index) => isObject(entry) && entry.situationId === situationIds[index]);
}

function readSession(): GameSessionV1 | undefined {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (!isObject(parsed) || parsed.version !== 1 || !isObject(parsed.preparation) || !isModeId(parsed.preparation.modeId)) throw new Error("Session incompatible");
    if (parsed.preparation.characterId !== undefined && !isCharacterId(parsed.preparation.characterId)) throw new Error("Personnage invalide");
    if (parsed.active !== undefined && !isValidActiveGame(parsed.active)) throw new Error("Partie invalide");
    return parsed as unknown as GameSessionV1;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

function writeSession(session: GameSessionV1) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadGameSession(): GameSessionV1 | undefined {
  return readSession();
}

export function saveGamePreparation(modeId: GameModeId, characterId?: EditorialCharacterIdV2) {
  const current = readSession();
  writeSession({ version: 1, preparation: { modeId, characterId }, active: current?.active });
}

export function saveActiveGame(snapshot: ActiveGameSnapshot) {
  if (!isValidActiveGame(snapshot)) throw new Error("Snapshot de partie invalide");
  writeSession({ version: 1, preparation: { modeId: snapshot.selectedModeId, characterId: snapshot.selectedCharacterId }, active: snapshot });
}

export function clearActiveGame() {
  const current = readSession();
  if (!current) return;
  writeSession({ version: 1, preparation: current.preparation });
}
