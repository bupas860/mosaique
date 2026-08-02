import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import PublicFrame from "./components/public/PublicFrame";
import { getPublicBiographyV2 } from "./data/v2/publicBiographiesV2";
import CharacterBiographyPage from "./pages/CharacterBiographyPage";
import ExplorerCharactersPage from "./pages/ExplorerCharactersPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import PublicHomePage from "./pages/public/PublicHomePage";
import StructuralPage from "./pages/public/StructuralPage";
import { parseAppRoute, subscribeAppRoute, type AppRoute } from "./utils/appRoute";

const GameApp = lazy(() => import("./game/GameApp"));

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

function pageForRoute(route: AppRoute): ReactNode {
  if (route.kind === "home") return <PublicHomePage />;
  if (route.kind === "game") return gamePage();
  if (route.kind === "explorer-characters") return <ExplorerCharactersPage />;
  if (route.kind === "character-biography") return <CharacterBiographyPage biography={getPublicBiographyV2(route.characterId)} />;
  if (route.kind === "situations") return <StructuralPage title="Situations" description="Cet espace permet d’explorer le corpus public de situations illustrées." />;
  if (route.kind === "reperes") return <StructuralPage title="Repères" />;
  return <NotFoundPage />;
}

function titleForRoute(route: AppRoute): string {
  if (route.kind === "character-biography") return `${getPublicBiographyV2(route.characterId).name} — Personnages — Mosaïque`;
  return routeTitles[route.kind] ?? "Mosaïque";
}

export default function App() {
  const [route, setRoute] = useState(parseAppRoute);
  const routeKey = window.location.hash || "#/";

  useEffect(() => subscribeAppRoute(() => setRoute(parseAppRoute())), []);
  useEffect(() => {
    if (route.kind !== "redirect") return;
    window.location.replace(route.target);
  }, [route]);
  useEffect(() => {
    if (route.kind === "redirect") return;
    document.title = titleForRoute(route);
    window.requestAnimationFrame(() => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
  }, [route]);

  if (route.kind === "redirect") return null;
  return <PublicFrame route={route} routeKey={routeKey}>{pageForRoute(route)}</PublicFrame>;
}
