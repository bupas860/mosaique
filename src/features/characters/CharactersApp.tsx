import { useLayoutEffect } from "react";
import { publicBiographiesV2 } from "../../data/v2/publicBiographiesV2";
import CharacterBiographyPage from "../../pages/CharacterBiographyPage";
import ExplorerCharactersPage from "../../pages/ExplorerCharactersPage";
import type { AppRoute } from "../../utils/appRoute";
import { publicDocumentTitle } from "../../utils/publicIdentity";
import JourneyWordsPage from "./JourneyWordsPage";

type CharactersRoute = Extract<AppRoute, { kind: "explorer-characters" | "character-biography" | "characters-words" }>;

function titleFor(route: CharactersRoute): string {
  if (route.kind === "explorer-characters") return publicDocumentTitle("Personnages");
  if (route.kind === "characters-words") return publicDocumentTitle("Personnages", "Mots et parcours");
  const biography = publicBiographiesV2.find(({ id }) => id === route.characterId);
  return biography ? publicDocumentTitle("Personnages", biography.name) : publicDocumentTitle("Page introuvable");
}

export default function CharactersApp({ route }: { route: CharactersRoute }) {
  useLayoutEffect(() => {
    document.title = titleFor(route);
  }, [route]);
  if (route.kind === "explorer-characters") return <ExplorerCharactersPage />;
  if (route.kind === "characters-words") return <JourneyWordsPage />;
  const biography = publicBiographiesV2.find(({ id }) => id === route.characterId);
  return biography ? <CharacterBiographyPage key={biography.id} biography={biography} /> : null;
}
