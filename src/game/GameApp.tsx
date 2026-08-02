import { useEffect, useState } from "react";
import {
  createActiveGameSet,
  getActiveCharactersForMode,
  isActiveGameModeId,
} from "../data/v2/activeModesRuntimeV2";
import { DEFAULT_GAME_MODE_ID, gameModes } from "../data/gameModes";
import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { GameModeId } from "../types/gameMode";
import type { RuntimeGameSetV2 } from "../types/runtimeV2";
import CharacterSelectionPage from "../pages/CharacterSelectionPage";
import GamePage from "../pages/GamePage";
import HomePage from "../pages/HomePage";
import ModeSelectionPage from "../pages/ModeSelectionPage";

type Screen = "home" | "mode-selection" | "character-selection" | "game";

export default function GameApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCharacterId, setSelectedCharacterId] = useState<EditorialCharacterIdV2>();
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(DEFAULT_GAME_MODE_ID);
  const [gameSet, setGameSet] = useState<RuntimeGameSetV2>();

  useEffect(() => {
    if (screen === "game" && selectedCharacterId) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [screen, selectedCharacterId]);

  function startGame(characterId: EditorialCharacterIdV2) {
    const selectedMode = gameModes.find(({ id }) => id === selectedModeId);
    if (!selectedMode?.available || !isActiveGameModeId(selectedMode.id)) {
      throw new Error(`Aucune banque jouable pour le mode ${selectedModeId}`);
    }
    setGameSet(createActiveGameSet(selectedMode.id, characterId));
    setSelectedCharacterId(characterId);
    setScreen("game");
  }

  function chooseAnotherCharacter() {
    setGameSet(undefined);
    setScreen("character-selection");
  }

  function returnHome() {
    setSelectedModeId(DEFAULT_GAME_MODE_ID);
    setSelectedCharacterId(undefined);
    setGameSet(undefined);
    setScreen("home");
  }

  function selectMode(modeId: GameModeId) {
    setSelectedModeId(modeId);
    setSelectedCharacterId(undefined);
    setGameSet(undefined);
  }

  if (screen === "mode-selection") {
    return <ModeSelectionPage selectedModeId={selectedModeId} onSelect={selectMode} onContinue={() => setScreen("character-selection")} onBack={() => setScreen("home")} />;
  }
  if (screen === "character-selection") {
    if (!isActiveGameModeId(selectedModeId)) {
      throw new Error(`Aucune galerie jouable pour le mode ${selectedModeId}`);
    }
    return <CharacterSelectionPage characters={getActiveCharactersForMode(selectedModeId)} onSelect={startGame} onBack={() => setScreen("mode-selection")} />;
  }
  if (screen === "game" && selectedCharacterId && gameSet && isActiveGameModeId(gameSet.modeId)) {
    return <GamePage initialGameSet={gameSet} selectedCharacterId={selectedCharacterId} selectedModeId={gameSet.modeId} onChooseAnotherCharacter={chooseAnotherCharacter} onBackHome={returnHome} />;
  }
  return <HomePage onStart={() => setScreen("mode-selection")} />;
}
