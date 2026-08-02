import { useState } from "react";
import { publicFocals, publicSituations, publicSituationsIntroduction } from "../../data/public/publicSituations.generated";
import PublicSituationGrid from "./PublicSituationGrid";
import { filterPublicSituations, type FocalFilter, type RoleFilter } from "./situationFilters";

const focalOptions = [{ value: "all", label: "Toutes les focales" }, ...publicFocals.map((focal) => ({ value: focal.id, label: focal.label }))];

export default function SituationsGalleryPage() {
  const [focal, setFocal] = useState<FocalFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const results = filterPublicSituations(publicSituations, focal, role);
  const reset = () => { setFocal("all"); setRole("all"); };
  return (
    <main className="public-situations-page">
      <header className="public-situations-intro">
        <h1>Situations</h1>
        {publicSituationsIntroduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <p className="public-situations-counts"><strong>61 situations</strong><span>53 obstacles</span><span>8 protections</span></p>
        <aside className="public-situations-warning"><strong>{publicSituationsIntroduction.warningTitle}</strong><p>{publicSituationsIntroduction.warning}</p></aside>
      </header>
      <nav className="public-focal-links" aria-label="Explorer les focales">
        {publicFocals.map((item) => <a key={item.id} href={`#/situations/focales/${item.slug}`}>{item.label}</a>)}
      </nav>
      <section className="public-situation-filters" aria-labelledby="situation-filters-title">
        <h2 id="situation-filters-title">Filtrer les situations</h2>
        <div className="public-situation-filters__controls">
          <label>Focale<select value={focal} onChange={(event) => setFocal(event.target.value as FocalFilter)}>{focalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>Rôle<select value={role} onChange={(event) => setRole(event.target.value as RoleFilter)}><option value="all">Tous les rôles</option><option value="obstacle">Obstacle</option><option value="protection">Protection</option></select></label>
          <button type="button" onClick={reset} disabled={focal === "all" && role === "all"}>Réinitialiser les filtres</button>
        </div>
        <p className="public-situation-results" role="status" aria-live="polite">{results.length} {results.length > 1 ? "résultats" : "résultat"}</p>
      </section>
      {results.length > 0 ? <PublicSituationGrid situations={results} /> : <section className="public-situations-empty"><h2>Aucune situation ne correspond à ces filtres.</h2><button type="button" onClick={reset}>Réinitialiser les filtres</button></section>}
    </main>
  );
}
