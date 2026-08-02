import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import ExplorerCharactersPage from "./pages/ExplorerCharactersPage";
import CharacterBiographyPage from "./pages/CharacterBiographyPage";
import { getPublicBiographyV2 } from "./data/v2/publicBiographiesV2";
import { EXPLORER_CHARACTERS_HASH, parseAppRoute, subscribeAppRoute } from "./utils/appRoute";
import UnderstandAsyncBoundary from "./components/UnderstandAsyncBoundary";

const GameApp = lazy(() => import("./game/GameApp"));
const UnderstandHomePage = lazy(() => import("./pages/understand/UnderstandHomePage"));
const UnderstandModulesPage = lazy(() => import("./pages/understand/UnderstandModulesPage"));
const UnderstandReadingPathPage = lazy(() => import("./pages/understand/UnderstandReadingPathPage"));
const UnderstandModulePage = lazy(() => import("./pages/understand/UnderstandModulePage"));
const UnderstandGlossaryPage = lazy(() => import("./pages/understand/UnderstandGlossaryPage"));
const UnderstandBibliographyPage = lazy(() => import("./pages/understand/UnderstandBibliographyPage"));

function understandPage(content: ReactNode) {
  return <UnderstandAsyncBoundary><Suspense fallback={<main className="understand-state" aria-busy="true" aria-live="polite"><p>Chargement de Comprendre…</p></main>}>{content}</Suspense></UnderstandAsyncBoundary>;
}

function gamePage() {
  return <Suspense fallback={<main className="understand-state" aria-busy="true" aria-live="polite"><p>Chargement du jeu…</p></main>}><GameApp /></Suspense>;
}

export default function App() {
  const [route, setRoute] = useState(parseAppRoute);
  useEffect(() => subscribeAppRoute(() => setRoute(parseAppRoute())), []);
  if (route.kind === "explorer-characters") return <ExplorerCharactersPage />;
  if (route.kind === "character-biography") return <CharacterBiographyPage biography={getPublicBiographyV2(route.characterId)} />;
  if (route.kind === "understand-home") return understandPage(<UnderstandHomePage />);
  if (route.kind === "understand-modules") return understandPage(<UnderstandModulesPage />);
  if (route.kind === "understand-reading-path") return understandPage(<UnderstandReadingPathPage pathId={route.pathId} />);
  if (route.kind === "understand-module") return understandPage(<UnderstandModulePage moduleId={route.moduleId} sectionId={route.sectionId} />);
  if (route.kind === "understand-glossary") return understandPage(<UnderstandGlossaryPage notionId={route.notionId} />);
  if (route.kind === "understand-bibliography") return understandPage(<UnderstandBibliographyPage sourceId={route.sourceId} />);
  if (route.kind === "not-found") return <main className="route-not-found"><div><h1>Page introuvable</h1><p>Cette page n’existe pas.</p>{route.fragment.startsWith("#/comprendre") ? <><a href="#/comprendre">Retour à Comprendre</a> · <a href="#/comprendre/modules">Voir les modules</a></> : <a href={EXPLORER_CHARACTERS_HASH}>Voir tous les personnages</a>}</div></main>;
  return gamePage();
}
