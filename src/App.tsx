import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import HowToPlayPage from "./pages/HowToPlayPage";
import ModeSelectionPage from "./pages/ModeSelectionPage";
import CharacterSelectionPage from "./pages/CharacterSelectionPage";
import GamePage from "./pages/GamePage";
import { playableCharacters } from "./data";
import { DEFAULT_GAME_MODE_ID } from "./data/gameModes";
import type { GameModeId } from "./types/gameMode";
type Screen = "home" | "how-to-play" | "mode-selection" | "character-selection" | "game";
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>();
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(DEFAULT_GAME_MODE_ID);
  useEffect(() => { if (screen === "game" && selectedCharacterId) window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [screen, selectedCharacterId]);
  function startGame(characterId: string) { setSelectedCharacterId(characterId); setScreen("game"); }
  if (screen === "how-to-play") return <HowToPlayPage onContinue={() => setScreen("mode-selection")} onBack={() => setScreen("home")} />;
  if (screen === "mode-selection") return <ModeSelectionPage selectedModeId={selectedModeId} onSelect={setSelectedModeId} onContinue={() => setScreen("character-selection")} onBack={() => setScreen("how-to-play")} />;
  if (screen === "character-selection") return <CharacterSelectionPage characters={playableCharacters} onSelect={startGame} onBack={() => setScreen("mode-selection")} />;
  if (screen === "game" && selectedCharacterId) return <GamePage selectedCharacterId={selectedCharacterId} selectedModeId={selectedModeId} onChooseAnotherCharacter={() => setScreen("character-selection")} onBackHome={() => { setSelectedModeId(DEFAULT_GAME_MODE_ID); setScreen("home"); }} />;
  return <HomePage onStart={() => setScreen("how-to-play")} />;
}
