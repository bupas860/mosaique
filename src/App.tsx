import { useEffect, useState } from "react";
import { createVisibleObstaclesGameSet, playableCharactersV2 } from "./data/v2";
import { DEFAULT_GAME_MODE_ID, gameModes } from "./data/gameModes";
import HomePage from "./pages/HomePage";
import ModeSelectionPage from "./pages/ModeSelectionPage";
import CharacterSelectionPage from "./pages/CharacterSelectionPage";
import GamePage from "./pages/GamePage";
import type { CharacterIdV2 } from "./types/editorialV2";
import type { GameModeId } from "./types/gameMode";
import type { VisibleObstaclesGameSet } from "./types/runtimeV2";

type Screen = "home" | "mode-selection" | "character-selection" | "game";
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterIdV2>();
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(DEFAULT_GAME_MODE_ID);
  const [gameSet, setGameSet] = useState<VisibleObstaclesGameSet>();
  useEffect(() => { if (screen === "game" && selectedCharacterId) window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [screen, selectedCharacterId]);
  function startGame(characterId: CharacterIdV2) {
    const selectedMode = gameModes.find(({ id }) => id === selectedModeId);
    if (!selectedMode?.available || selectedMode.id !== "visible-obstacles") throw new Error(`Aucune banque jouable pour le mode ${selectedModeId}`);
    setGameSet(createVisibleObstaclesGameSet());
    setSelectedCharacterId(characterId);
    setScreen("game");
  }
  function chooseAnotherCharacter() { setGameSet(undefined); setScreen("character-selection"); }
  function returnHome() { setSelectedModeId(DEFAULT_GAME_MODE_ID); setSelectedCharacterId(undefined); setGameSet(undefined); setScreen("home"); }
  if (screen === "mode-selection") return <ModeSelectionPage selectedModeId={selectedModeId} onSelect={setSelectedModeId} onContinue={() => setScreen("character-selection")} onBack={() => setScreen("home")} />;
  if (screen === "character-selection") return <CharacterSelectionPage characters={playableCharactersV2} onSelect={startGame} onBack={() => setScreen("mode-selection")} />;
  if (screen === "game" && selectedCharacterId && gameSet) return <GamePage initialGameSet={gameSet} selectedCharacterId={selectedCharacterId} selectedModeId={selectedModeId} onChooseAnotherCharacter={chooseAnotherCharacter} onBackHome={returnHome} />;
  return <HomePage onStart={() => setScreen("mode-selection")} />;
}
