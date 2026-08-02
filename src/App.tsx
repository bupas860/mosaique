import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import PublicFrame from "./components/public/PublicFrame";
import NotFoundPage from "./pages/public/NotFoundPage";
import PublicHomePage from "./pages/public/PublicHomePage";
import { parseAppRoute, subscribeAppRoute, type AppRoute } from "./utils/appRoute";

const GameApp = lazy(() => import("./game/GameApp"));
const SituationsApp = lazy(() => import("./features/situations/SituationsApp"));
const CharactersApp = lazy(() => import("./features/characters/CharactersApp"));
const ReperesApp = lazy(() => import("./features/reperes/ReperesApp"));
const UsefulWordsApp = lazy(() => import("./features/useful-words/UsefulWordsApp"));
const CharacterQuizApp = lazy(() => import("./features/quiz/CharacterQuizApp"));
const SituationQuizApp = lazy(() => import("./features/quiz/SituationQuizApp"));

const routeTitles: Partial<Record<AppRoute["kind"], string>> = {
  home: "Mosaïque",
  game: "Jouer — Mosaïque",
  "explorer-characters": "Personnages — Mosaïque",
  situations: "Situations — Mosaïque",
  reperes: "Repères — Mosaïque",
  "not-found": "Page introuvable — Mosaïque",
};

function gamePage() {
  return <Suspense fallback={<main className="game-loading" aria-busy="true" aria-live="polite"><p>Chargement du jeu…</p></main>}><GameApp /></Suspense>;
}

function situationsPage(route: Extract<AppRoute, { kind: "situations" | "situations-focal" | "situation-detail" }>) {
  return <Suspense fallback={<main className="game-loading" aria-busy="true" aria-live="polite"><p>Chargement des situations…</p></main>}><SituationsApp route={route} /></Suspense>;
}

function charactersPage(route: Extract<AppRoute, { kind: "explorer-characters" | "character-biography" | "characters-words" }>) {
  return <Suspense fallback={<main className="game-loading" aria-busy="true" aria-live="polite"><p>Chargement des personnages…</p></main>}><CharactersApp route={route} /></Suspense>;
}

function reperesPage(route: Extract<AppRoute, { kind: "reperes" | "repere-detail" }>) {
  return <Suspense fallback={<main className="game-loading" aria-busy="true" aria-live="polite"><p>Chargement des repères…</p></main>}><ReperesApp route={route} /></Suspense>;
}

function usefulWordsPage(route: Extract<AppRoute, { kind: "useful-words" | "useful-word-detail" }>) {
  return <Suspense fallback={<main className="game-loading" aria-busy="true" aria-live="polite"><p>Chargement des mots utiles…</p></main>}><UsefulWordsApp route={route} /></Suspense>;
}

const quizLoading = <main className="game-loading" aria-busy="true" aria-live="polite"><p>Chargement du quiz…</p></main>;

function pageForRoute(route: AppRoute): ReactNode {
  if (route.kind === "home") return <PublicHomePage />;
  if (route.kind === "game") return gamePage();
  if (route.kind === "explorer-characters" || route.kind === "character-biography" || route.kind === "characters-words") return charactersPage(route);
  if (route.kind === "situations" || route.kind === "situations-focal" || route.kind === "situation-detail") return situationsPage(route);
  if (route.kind === "reperes" || route.kind === "repere-detail") return reperesPage(route);
  if (route.kind === "useful-words" || route.kind === "useful-word-detail") return usefulWordsPage(route);
  if (route.kind === "character-quiz") return <Suspense fallback={quizLoading}><CharacterQuizApp /></Suspense>;
  if (route.kind === "situation-quiz") return <Suspense fallback={quizLoading}><SituationQuizApp /></Suspense>;
  return <NotFoundPage />;
}

function titleForRoute(route: AppRoute): string { return routeTitles[route.kind] ?? "Mosaïque"; }

export default function App() {
  const [route, setRoute] = useState(parseAppRoute);
  const routeKey = window.location.hash || "#/";

  useEffect(() => subscribeAppRoute(() => setRoute(parseAppRoute())), []);
  useEffect(() => {
    if (route.kind !== "redirect") return;
    window.location.replace(route.target);
  }, [route]);
  useEffect(() => {
    if (route.kind === "redirect" || route.kind === "situations" || route.kind === "situations-focal" || route.kind === "situation-detail" || route.kind === "explorer-characters" || route.kind === "character-biography" || route.kind === "characters-words" || route.kind === "reperes" || route.kind === "repere-detail" || route.kind === "useful-words" || route.kind === "useful-word-detail" || route.kind === "character-quiz" || route.kind === "situation-quiz") return;
    document.title = titleForRoute(route);
    window.requestAnimationFrame(() => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
  }, [route]);

  if (route.kind === "redirect") return null;
  return <PublicFrame route={route} routeKey={routeKey}>{pageForRoute(route)}</PublicFrame>;
}
