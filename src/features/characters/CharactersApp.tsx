import { useLayoutEffect } from "react";
import { publicBiographiesV2 } from "../../data/v2/publicBiographiesV2";
import CharacterBiographyPage from "../../pages/CharacterBiographyPage";
import ExplorerCharactersPage from "../../pages/ExplorerCharactersPage";
import type { AppRoute } from "../../utils/appRoute";
import JourneyWordsPage from "./JourneyWordsPage";

type CharactersRoute = Extract<AppRoute, { kind: "explorer-characters" | "character-biography" | "characters-words" }>;

function titleFor(route: CharactersRoute): string {
  if (route.kind === "explorer-characters") return "Personnages — Mosaïque";
  if (route.kind === "characters-words") return "Mots et parcours — Personnages — Mosaïque";
  const biography = publicBiographiesV2.find(({ id }) => id === route.characterId);
  return biography ? `${biography.name} — ${biography.galleryLabel} — Personnages — Mosaïque` : "Page introuvable — Mosaïque";
}

export default function CharactersApp({ route }: { route: CharactersRoute }) {
  useLayoutEffect(() => {
    document.title = titleFor(route);
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
  }, [route]);
  if (route.kind === "explorer-characters") return <ExplorerCharactersPage />;
  if (route.kind === "characters-words") return <JourneyWordsPage />;
  const biography = publicBiographiesV2.find(({ id }) => id === route.characterId);
  return biography ? <CharacterBiographyPage biography={biography} /> : null;
}
