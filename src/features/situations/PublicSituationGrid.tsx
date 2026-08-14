import type { PublicSituation } from "../../data/public/publicSituations.types";
import PublicSituationCard from "./PublicSituationCard";

export default function PublicSituationGrid({ situations, showFocal = true }: { situations: readonly PublicSituation[]; showFocal?: boolean }) {
  return <div className="public-situations-grid">{situations.map((situation) => <PublicSituationCard key={situation.code} situation={situation} showFocal={showFocal} />)}</div>;
}
