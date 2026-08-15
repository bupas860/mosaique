import { useEffect, useRef, useState } from "react";
import { createActiveGameSet, getActiveCharactersForMode, isActiveGameModeId } from "../data/v2/activeModesRuntimeV2";
import { DEFAULT_GAME_MODE_ID, gameModes } from "../data/gameModes";
import GamePage from "../pages/GamePage";
import GamePreparationPage from "../pages/GamePreparationPage";
import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { GameModeId } from "../types/gameMode";
import type { RuntimeGameSetV2 } from "../types/runtimeV2";
import { isEleaContext } from "../utils/appRoute";
import { PUBLIC_ACTIVITY, publicDocumentTitle } from "../utils/publicIdentity";
import { clearActiveGame, loadGameSession, saveGamePreparation } from "./gameSession";

type Screen = "preparation" | "game";

export default function GameApp() {
  const [storedSession] = useState(loadGameSession);
  const storedActive = storedSession?.active;
  const [screen, setScreen] = useState<Screen>(storedActive ? "game" : "preparation");
  const previousScreen = useRef<Screen>(screen);
  const remembered = window.history.state?.mosaiqueGamePreparation as { modeId?: GameModeId; characterId?: EditorialCharacterIdV2 } | undefined;
  const candidateMode = storedActive?.selectedModeId ?? storedSession?.preparation.modeId ?? remembered?.modeId;
  const rememberedMode = candidateMode && gameModes.some(({ id, available }) => id === candidateMode && available) ? candidateMode : DEFAULT_GAME_MODE_ID;
  const candidateCharacter = storedActive?.selectedCharacterId ?? storedSession?.preparation.characterId ?? remembered?.characterId;
  const rememberedCharacter = candidateCharacter && isActiveGameModeId(rememberedMode) && getActiveCharactersForMode(rememberedMode).some(({ id }) => id === candidateCharacter) ? candidateCharacter : undefined;
  const [selectedCharacterId, setSelectedCharacterId] = useState<EditorialCharacterIdV2 | undefined>(rememberedCharacter);
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(rememberedMode);
  const [gameSet, setGameSet] = useState<RuntimeGameSetV2 | undefined>(storedActive?.gameSet);

  useEffect(() => { document.title = publicDocumentTitle(PUBLIC_ACTIVITY); }, []);
  useEffect(() => {
    if (screen !== "preparation") return;
    window.history.replaceState({ ...window.history.state, mosaiqueGamePreparation: { modeId: selectedModeId, characterId: selectedCharacterId } }, "");
    saveGamePreparation(selectedModeId, selectedCharacterId);
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

  function returnToPreparation(preserveCharacter = true) {
    clearActiveGame();
    setGameSet(undefined);
    if (!preserveCharacter) setSelectedCharacterId(undefined);
    setScreen("preparation");
  }

  function chooseAnotherCharacter() { returnToPreparation(false); }
  function leaveSummary() {
    clearActiveGame();
    setGameSet(undefined);
    if (isEleaContext()) setScreen("preparation");
    else window.location.hash = "#/";
  }

  if (screen === "game" && selectedCharacterId && gameSet && isActiveGameModeId(gameSet.modeId)) {
    return <GamePage initialGameSet={gameSet} initialSnapshot={storedActive} selectedCharacterId={selectedCharacterId} selectedModeId={gameSet.modeId} onQuit={() => returnToPreparation(true)} onChooseAnotherCharacter={chooseAnotherCharacter} onBackHome={leaveSummary} backHomeLabel={isEleaContext() ? "Retour à la préparation" : "Retour à l’accueil"} />;
  }
  if (!isActiveGameModeId(selectedModeId)) throw new Error(`Aucune galerie jouable pour le mode ${selectedModeId}`);
  return <GamePreparationPage selectedModeId={selectedModeId} selectedCharacterId={selectedCharacterId} characters={getActiveCharactersForMode(selectedModeId)} onSelectMode={selectMode} onSelectCharacter={setSelectedCharacterId} onStart={startGame} />;
}
