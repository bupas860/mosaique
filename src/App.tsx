import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import {
  createActiveGameSet,
  getActiveCharactersForMode,
  isActiveGameModeId,
} from "./data/v2/activeModesRuntimeV2";
import { DEFAULT_GAME_MODE_ID, gameModes } from "./data/gameModes";
import HomePage from "./pages/HomePage";
import ModeSelectionPage from "./pages/ModeSelectionPage";
import CharacterSelectionPage from "./pages/CharacterSelectionPage";
import GamePage from "./pages/GamePage";
import ExplorerCharactersPage from "./pages/ExplorerCharactersPage";
import CharacterBiographyPage from "./pages/CharacterBiographyPage";
import { getPublicBiographyV2 } from "./data/v2/publicBiographiesV2";
import { EXPLORER_CHARACTERS_HASH, parseAppRoute, subscribeAppRoute } from "./utils/appRoute";
import type { EditorialCharacterIdV2 } from "./types/editorialV2";
import type { GameModeId } from "./types/gameMode";
import type { RuntimeGameSetV2 } from "./types/runtimeV2";
import UnderstandAsyncBoundary from "./components/UnderstandAsyncBoundary";

const UnderstandHomePage = lazy(() => import("./pages/understand/UnderstandHomePage"));
const UnderstandModulesPage = lazy(() => import("./pages/understand/UnderstandModulesPage"));
const UnderstandReadingPathPage = lazy(() => import("./pages/understand/UnderstandReadingPathPage"));
const UnderstandModulePage = lazy(() => import("./pages/understand/UnderstandModulePage"));
const UnderstandGlossaryPage = lazy(() => import("./pages/understand/UnderstandGlossaryPage"));
const UnderstandBibliographyPage = lazy(() => import("./pages/understand/UnderstandBibliographyPage"));

function understandPage(content: ReactNode) {
  return <UnderstandAsyncBoundary><Suspense fallback={<main className="understand-state" aria-busy="true" aria-live="polite"><p>Chargement de Comprendre…</p></main>}>{content}</Suspense></UnderstandAsyncBoundary>;
}

type Screen = "home" | "mode-selection" | "character-selection" | "game";
export default function App() {
  const [route, setRoute] = useState(parseAppRoute);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCharacterId, setSelectedCharacterId] = useState<EditorialCharacterIdV2>();
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(DEFAULT_GAME_MODE_ID);
  const [gameSet, setGameSet] = useState<RuntimeGameSetV2>();
  useEffect(() => subscribeAppRoute(() => setRoute(parseAppRoute())), []);
  useEffect(() => { if (screen === "game" && selectedCharacterId) window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [screen, selectedCharacterId]);
  function startGame(characterId: EditorialCharacterIdV2) {
    const selectedMode = gameModes.find(({ id }) => id === selectedModeId);
    if (!selectedMode?.available || !isActiveGameModeId(selectedMode.id)) throw new Error(`Aucune banque jouable pour le mode ${selectedModeId}`);
    setGameSet(createActiveGameSet(selectedMode.id, characterId));
    setSelectedCharacterId(characterId);
    setScreen("game");
  }
  function chooseAnotherCharacter() { setGameSet(undefined); setScreen("character-selection"); }
  function returnHome() { setSelectedModeId(DEFAULT_GAME_MODE_ID); setSelectedCharacterId(undefined); setGameSet(undefined); setScreen("home"); }
  function selectMode(modeId: GameModeId) {
    setSelectedModeId(modeId);
    setSelectedCharacterId(undefined);
    setGameSet(undefined);
  }
  if (route.kind === "explorer-characters") return <ExplorerCharactersPage />;
  if (route.kind === "character-biography") return <CharacterBiographyPage biography={getPublicBiographyV2(route.characterId)} />;
  if (route.kind === "understand-home") return understandPage(<UnderstandHomePage />);
  if (route.kind === "understand-modules") return understandPage(<UnderstandModulesPage />);
  if (route.kind === "understand-reading-path") return understandPage(<UnderstandReadingPathPage pathId={route.pathId} />);
  if (route.kind === "understand-module") return understandPage(<UnderstandModulePage moduleId={route.moduleId} sectionId={route.sectionId} />);
  if (route.kind === "understand-glossary") return understandPage(<UnderstandGlossaryPage notionId={route.notionId} />);
  if (route.kind === "understand-bibliography") return understandPage(<UnderstandBibliographyPage sourceId={route.sourceId} />);
  if (route.kind === "not-found") return <main className="route-not-found"><div><h1>Page introuvable</h1><p>Cette page n’existe pas.</p>{route.fragment.startsWith("#/comprendre") ? <><a href="#/comprendre">Retour à Comprendre</a> · <a href="#/comprendre/modules">Voir les modules</a></> : <a href={EXPLORER_CHARACTERS_HASH}>Voir tous les personnages</a>}</div></main>;
  if (screen === "mode-selection") return <ModeSelectionPage selectedModeId={selectedModeId} onSelect={selectMode} onContinue={() => setScreen("character-selection")} onBack={() => setScreen("home")} />;
  if (screen === "character-selection") {
    if (!isActiveGameModeId(selectedModeId)) throw new Error(`Aucune galerie jouable pour le mode ${selectedModeId}`);
    return <CharacterSelectionPage characters={getActiveCharactersForMode(selectedModeId)} onSelect={startGame} onBack={() => setScreen("mode-selection")} />;
  }
  if (screen === "game" && selectedCharacterId && gameSet && isActiveGameModeId(gameSet.modeId)) return <GamePage initialGameSet={gameSet} selectedCharacterId={selectedCharacterId} selectedModeId={gameSet.modeId} onChooseAnotherCharacter={chooseAnotherCharacter} onBackHome={returnHome} />;
  return <HomePage onStart={() => setScreen("mode-selection")} />;
}
