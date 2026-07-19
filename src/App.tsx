import { useState } from "react";

import HomePage from "./pages/HomePage";
import CharacterSelectionPage from "./pages/CharacterSelectionPage";
import GamePage from "./pages/GamePage";
import { playableCharacters } from "./content";

type Screen = "home" | "character-selection" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>();

  function startGame(characterId: string) {
    setSelectedCharacterId(characterId);
    setScreen("game");
  }

  if (screen === "character-selection") {
    return <CharacterSelectionPage characters={playableCharacters} onSelect={startGame} />;
  }

  if (screen === "game" && selectedCharacterId) {
    return (
      <GamePage
        selectedCharacterId={selectedCharacterId}
        onChooseAnotherCharacter={() => setScreen("character-selection")}
      />
    );
  }

  return <HomePage onStart={() => setScreen("character-selection")} />;
}
