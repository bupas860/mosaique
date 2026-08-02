import type { PublicSituation } from "../../data/public/publicSituations.types";
import PublicSituationImage from "./PublicSituationImage";
import { firstCompleteSentence } from "./situationFilters";

export default function PublicSituationCard({ situation }: { situation: PublicSituation }) {
  return (
    <article className={`public-situation-card public-situation-card--${situation.role}`}>
      <a className="public-situation-card__link" href={`#/situations/${situation.code}`}>
        <PublicSituationImage code={situation.code} filename={situation.illustrationFile} altText={situation.altText} />
        <div className="public-situation-card__body">
          <p className="public-situation-card__code">{situation.code}</p>
          <h2>{situation.title}</h2>
          <p className="public-situation-card__labels"><span>{situation.focalLabel}</span><span>{situation.role === "obstacle" ? "Obstacle" : "Protection"}</span></p>
          <p>{firstCompleteSentence(situation.observe[0] ?? "")}</p>
          <span className="public-situation-card__action">Voir la fiche complète</span>
        </div>
      </a>
    </article>
  );
}
