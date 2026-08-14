import { useLayoutEffect } from "react";
import { publicFocals, publicSituations } from "../../data/public/publicSituations.generated";
import type { AppRoute } from "../../utils/appRoute";
import { publicDocumentTitle } from "../../utils/publicIdentity";
import SituationDetailPage from "./SituationDetailPage";
import SituationsFocalPage from "./SituationsFocalPage";
import SituationsGalleryPage from "./SituationsGalleryPage";

type SituationsRoute = Extract<AppRoute, { kind: "situations" | "situations-focal" | "situation-detail" }>;

function routeTitle(route: SituationsRoute): string {
  if (route.kind === "situations") return publicDocumentTitle("Situations");
  if (route.kind === "situations-focal") return publicDocumentTitle("Situations", publicFocals.find((focal) => focal.slug === route.focalSlug)?.label ?? "Situations");
  const situation = publicSituations.find((item) => item.code === route.code);
  return situation ? publicDocumentTitle("Situations", situation.title) : publicDocumentTitle("Page introuvable");
}

export default function SituationsApp({ route, focusRoute }: { route: SituationsRoute; focusRoute: boolean }) {
  useLayoutEffect(() => {
    document.title = routeTitle(route);
    if (focusRoute) document.querySelector<HTMLElement>("[data-situations-route-heading]")?.focus();
  }, [focusRoute, route]);
  if (route.kind === "situations") return <SituationsGalleryPage />;
  if (route.kind === "situations-focal") return <SituationsFocalPage focalSlug={route.focalSlug} />;
  return <SituationDetailPage key={route.code} code={route.code} />;
}
