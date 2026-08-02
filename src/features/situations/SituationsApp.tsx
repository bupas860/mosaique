import { useLayoutEffect } from "react";
import { publicFocals, publicSituations } from "../../data/public/publicSituations.generated";
import type { AppRoute } from "../../utils/appRoute";
import SituationDetailPage from "./SituationDetailPage";
import SituationsFocalPage from "./SituationsFocalPage";
import SituationsGalleryPage from "./SituationsGalleryPage";

type SituationsRoute = Extract<AppRoute, { kind: "situations" | "situations-focal" | "situation-detail" }>;

function routeTitle(route: SituationsRoute): string {
  if (route.kind === "situations") return "Situations — Mosaïque";
  if (route.kind === "situations-focal") return `${publicFocals.find((focal) => focal.slug === route.focalSlug)?.label ?? "Situations"} — Situations — Mosaïque`;
  const situation = publicSituations.find((item) => item.code === route.code);
  return situation ? `${situation.code} — ${situation.title} — Mosaïque` : "Page introuvable — Mosaïque";
}

export default function SituationsApp({ route }: { route: SituationsRoute }) {
  useLayoutEffect(() => {
    document.title = routeTitle(route);
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
  }, [route]);
  if (route.kind === "situations") return <SituationsGalleryPage />;
  if (route.kind === "situations-focal") return <SituationsFocalPage focalSlug={route.focalSlug} />;
  return <SituationDetailPage code={route.code} />;
}
