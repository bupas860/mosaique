import { useState } from "react";
import { publicFocals, publicSituations, publicSituationsIntroduction } from "../../data/public/publicSituations.generated";
import PublicSituationGrid from "./PublicSituationGrid";
import { filterPublicSituations, type FocalFilter, type RoleFilter } from "./situationFilters";

const focalOptions = [{ value: "all", label: "Toutes les focales" }, ...publicFocals.map((focal) => ({ value: focal.id, label: focal.label }))];
const focalCards = {
  V: { description: "Quand une règle, un lieu ou une procédure crée directement une difficulté.", count: 16 },
  N: { description: "Quand des attentes considérées comme normales peuvent exclure ou contraindre.", count: 13 },
  I: { description: "Quand les conséquences d’une situation ne se voient pas immédiatement.", count: 16 },
  X: { description: "Quand plusieurs rapports sociaux se combinent et modifient une même situation.", count: 16 },
} as const;

export default function SituationsGalleryPage() {
  const [focal, setFocal] = useState<FocalFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const results = filterPublicSituations(publicSituations, focal, role);
  const reset = () => { setFocal("all"); setRole("all"); };
  return (
    <main className="public-situations-page">
      <header className="public-situations-intro">
        <h1 tabIndex={-1} data-situations-route-heading>Situations</h1>
        <p>Explorez des situations ordinaires du lycée pour comprendre ce qui peut créer un obstacle, ce qui peut protéger, et pourquoi une même situation ne se vit pas de la même manière pour tout le monde.</p>
      </header>
      <nav className="public-focal-links" aria-label="Explorer les focales">
        {publicFocals.map((item) => <a key={item.id} className={`public-focal-link public-focal-link--${item.id.toLowerCase()}`} href={`#/situations/focales/${item.slug}`}><strong>{item.label}</strong><span>{focalCards[item.id].description}</span><small>{focalCards[item.id].count} situations</small></a>)}
      </nav>
      <aside className="public-situations-guide" aria-label="Comprendre les filtres"><p><strong>La focale</strong> indique l’angle sous lequel la situation est analysée.</p><p><strong>Le rôle</strong> indique si la situation produit principalement un obstacle ou une protection.</p></aside>
      <p className="public-situations-counts">Dans le corpus : <strong>61 situations</strong>, dont <strong>53 obstacles</strong> et <strong>8 protections</strong>.</p>
      <aside className="public-situations-warning"><strong>{publicSituationsIntroduction.warningTitle}</strong><p>{publicSituationsIntroduction.warning}</p></aside>
      <section className="public-situation-filters" aria-labelledby="situation-filters-title">
        <h2 id="situation-filters-title">Toutes les situations</h2>
        <p>Filtrez la galerie par focale et par rôle.</p>
        <div className="public-situation-filters__controls">
          <label>Focale<select value={focal} onChange={(event) => setFocal(event.target.value as FocalFilter)}>{focalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>Rôle<select value={role} onChange={(event) => setRole(event.target.value as RoleFilter)}><option value="all">Tous les rôles</option><option value="obstacle">Obstacle</option><option value="protection">Protection</option></select></label>
          <button type="button" onClick={reset} disabled={focal === "all" && role === "all"}>Réinitialiser les filtres</button>
        </div>
        <p className="public-situation-results" role="status" aria-live="polite">{results.length} {results.length > 1 ? "résultats" : "résultat"}</p>
      </section>
      {results.length > 0 ? <PublicSituationGrid situations={results} /> : <section className="public-situations-empty"><h2>Aucune situation ne correspond à ces filtres.</h2><button type="button" onClick={reset}>Réinitialiser les filtres</button></section>}
      <aside className="public-situations-quiz"><h2>Tester votre compréhension des situations</h2><p><a href="#/situations/quiz" className="app-text-link">Quiz Situations</a></p></aside>
    </main>
  );
}
