import type { PublicSituation } from "../../data/public/publicSituations.types";
import PublicSituationImage from "./PublicSituationImage";
import { firstCompleteSentence } from "./situationFilters";

export default function PublicSituationCard({ situation, showFocal = true }: { situation: PublicSituation; showFocal?: boolean }) {
  return (
    <article className={`public-situation-card public-situation-card--${situation.role} public-situation-card--focal-${situation.focalId.toLowerCase()}`}>
      <a className="public-situation-card__link" href={`#/situations/${situation.code}`}>
        <PublicSituationImage code={situation.code} filename={situation.illustrationFile} altText={situation.altText} />
        <div className="public-situation-card__body">
          <h2>{situation.title}</h2>
          <p className="public-situation-card__labels">{showFocal ? <span className={`public-badge public-badge--focal-${situation.focalId.toLowerCase()}`}>{situation.focalLabel}</span> : null}<span className={`public-badge public-badge--${situation.role}`}>{situation.role === "obstacle" ? "Obstacle" : "Protection"}</span></p>
          <p>{firstCompleteSentence(situation.observe[0] ?? "")}</p>
          <span className="public-situation-card__action">Découvrir la situation</span>
        </div>
      </a>
    </article>
  );
}
