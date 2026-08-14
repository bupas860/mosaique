import { useEffect, useRef, useState } from "react";
import { createActiveGameSet, getActiveCharactersForMode, isActiveGameModeId } from "../data/v2/activeModesRuntimeV2";
import { DEFAULT_GAME_MODE_ID, gameModes } from "../data/gameModes";
import GamePage from "../pages/GamePage";
import GamePreparationPage from "../pages/GamePreparationPage";
import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { GameModeId } from "../types/gameMode";
import type { RuntimeGameSetV2 } from "../types/runtimeV2";
import { PUBLIC_ACTIVITY, publicDocumentTitle } from "../utils/publicIdentity";

type Screen = "preparation" | "game";

export default function GameApp() {
  const [screen, setScreen] = useState<Screen>("preparation");
  const previousScreen = useRef<Screen>(screen);
  const remembered = window.history.state?.mosaiqueGamePreparation as { modeId?: GameModeId; characterId?: EditorialCharacterIdV2 } | undefined;
  const rememberedMode = remembered?.modeId && gameModes.some(({ id, available }) => id === remembered.modeId && available) ? remembered.modeId : DEFAULT_GAME_MODE_ID;
  const rememberedCharacter = remembered?.characterId && isActiveGameModeId(rememberedMode) && getActiveCharactersForMode(rememberedMode).some(({ id }) => id === remembered.characterId) ? remembered.characterId : undefined;
  const [selectedCharacterId, setSelectedCharacterId] = useState<EditorialCharacterIdV2 | undefined>(rememberedCharacter);
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(rememberedMode);
  const [gameSet, setGameSet] = useState<RuntimeGameSetV2>();

  useEffect(() => { document.title = publicDocumentTitle(PUBLIC_ACTIVITY); }, []);
  useEffect(() => {
    if (screen !== "preparation") return;
    window.history.replaceState({ ...window.history.state, mosaiqueGamePreparation: { modeId: selectedModeId, characterId: selectedCharacterId } }, "");
  }, [screen, selectedCharacterId, selectedModeId]);
  useEffect(() => {
    if (previousScreen.current === screen) return;
    previousScreen.current = screen;
    requestAnimationFrame(() => {
      const title = document.querySelector<HTMLElement>("main h1") ?? document.querySelector<HTMLElement>(".situation-card h2");
      title?.setAttribute("tabindex", "-1");
      title?.focus({ preventScroll: true });
    });
  }, [screen]);

  function selectMode(modeId: GameModeId) {
    setSelectedModeId(modeId);
    setSelectedCharacterId(undefined);
    setGameSet(undefined);
  }

  function startGame() {
    const selectedMode = gameModes.find(({ id }) => id === selectedModeId);
    if (!selectedCharacterId || !selectedMode?.available || !isActiveGameModeId(selectedMode.id)) throw new Error(`Préparation de partie incomplète pour le mode ${selectedModeId}`);
    setGameSet(createActiveGameSet(selectedMode.id, selectedCharacterId));
    setScreen("game");
  }

  function chooseAnotherCharacter() { setGameSet(undefined); setSelectedCharacterId(undefined); setScreen("preparation"); }
  function returnHome() { window.location.hash = "#/"; }

  if (screen === "game" && selectedCharacterId && gameSet && isActiveGameModeId(gameSet.modeId)) {
    return <GamePage initialGameSet={gameSet} selectedCharacterId={selectedCharacterId} selectedModeId={gameSet.modeId} onChooseAnotherCharacter={chooseAnotherCharacter} onBackHome={returnHome} />;
  }
  if (!isActiveGameModeId(selectedModeId)) throw new Error(`Aucune galerie jouable pour le mode ${selectedModeId}`);
  return <GamePreparationPage selectedModeId={selectedModeId} selectedCharacterId={selectedCharacterId} characters={getActiveCharactersForMode(selectedModeId)} onSelectMode={selectMode} onSelectCharacter={setSelectedCharacterId} onStart={startGame} />;
}
