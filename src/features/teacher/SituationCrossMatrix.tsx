import { useMemo, useState } from "react";
import type { EditorialSituationIdV2 } from "../../types/editorialV2";
import {
  MATRIX_APPROACHES, MATRIX_DIMENSIONS, MATRIX_FAMILIES, MATRIX_GENERAL,
  MATRIX_INTERSECTION, MATRIX_INTERSECTION_GROUPS,
  matchesMatrixFilters, matrixGeneralCell, matrixIntersectionGroup,
  type MatrixEntry, type MatrixFilterId,
} from "./situationMatrixData";

type Props = {
  readonly chosenSituationIds: readonly EditorialSituationIdV2[];
};

export default function SituationCrossMatrix({ chosenSituationIds }: Props) {
  const [filters, setFilters] = useState<MatrixFilterId[]>([]);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const generalVisible = useMemo(
    () => MATRIX_GENERAL.filter(({ tags }) => matchesMatrixFilters(tags, filters)), [filters],
  );
  const intersectionVisible = useMemo(
    () => MATRIX_INTERSECTION.filter(({ tags }) => matchesMatrixFilters(tags, filters)), [filters],
  );
  const opened = [...MATRIX_GENERAL, ...MATRIX_INTERSECTION].find(({ situation }) => situation.id === openedId);

  function toggleFilter(filter: MatrixFilterId) {
    setFilters((previous) => previous.includes(filter) ? previous.filter((id) => id !== filter) : [...previous, filter]);
  }

  function codeButton({ situation }: MatrixEntry, x: boolean) {
    const selected = chosenSituationIds.includes(situation.id);
    return <button key={situation.id} type="button"
      className={`inline-flex min-h-9 items-center gap-1 rounded-lg border px-2 py-1 font-mono text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${openedId === situation.id ? "border-blue-800 bg-blue-800 text-white" : selected ? "border-teal-700 bg-teal-100 text-teal-950" : "border-slate-300 bg-white text-blue-900 hover:border-blue-600 hover:bg-blue-50"}`}
      title={situation.title}
      aria-label={`Voir la situation ${situation.id} : ${situation.title}${selected ? " (dans la sélection)" : ""}`}
      aria-pressed={openedId === situation.id}
      data-matrix-id={situation.id}
      data-gallery={x ? "intersection" : "general"}
      onClick={() => setOpenedId(openedId === situation.id ? null : situation.id)}>
      {situation.id}{selected && <span aria-hidden="true">✓</span>}
    </button>;
  }

  return <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="teacher-matrix-heading">
    <h2 id="teacher-matrix-heading" className="text-2xl font-bold text-slate-950">1. Vue croisée de toutes les situations</h2>
    <p className="mt-3 leading-relaxed text-slate-700">Les <strong>lignes</strong> correspondent aux trois mécanismes déjà présents dans le jeu.
      Les <strong>colonnes</strong> correspondent aux angles possibles de travail pédagogique.
      Chaque case donne les numéros des situations concernées : cliquez sur un numéro pour lire sa fiche.
      Une situation peut figurer dans plusieurs colonnes ; elle ne sera jamais dupliquée dans une partie.</p>
    <p className="mt-2 text-sm text-slate-700">Cette grille recense tout le corpus de la galerie générale : 16 obstacles visibles,
      13 normes ordinaires et 16 effets invisibles, soit <strong>45 situations distinctes</strong>.
      Le classement par angle est indicatif et différent des sept propositions complètes de séance.</p>

    <fieldset className="mt-5 rounded-xl border border-slate-300 bg-slate-50 p-4">
      <legend className="px-2 font-bold text-slate-900">Filtrer par réalité concernée</legend>
      <p className="mb-3 text-sm text-slate-700">
        Ces quatre repères ne sont ni des publics ni des niveaux scolaires. Une situation peut porter sur plusieurs dimensions.
        « Caractéristiques sexuées » inclut notamment les variations intersexes et évite de réduire les corps à deux catégories biologiques.
      </p>
      <div className="flex flex-wrap gap-3">
        {MATRIX_DIMENSIONS.map((dimension) =>
          <label key={dimension.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.includes(dimension.id) ? "border-blue-700 bg-blue-100" : "border-slate-300 bg-white"}`}>
            <input type="checkbox" className="h-4 w-4 accent-blue-700"
              checked={filters.includes(dimension.id)} onChange={() => toggleFilter(dimension.id)} />
            {dimension.label}
          </label>)}
        <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${filters.includes("transversal") ? "border-blue-700 bg-blue-100" : "border-slate-300 bg-white"}`}>
          <input type="checkbox" className="h-4 w-4 accent-blue-700"
            checked={filters.includes("transversal")} onChange={() => toggleFilter("transversal")} />
          Situations transversales
        </label>
        {filters.length > 0 && <button type="button" className="rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-bold text-blue-900" onClick={() => setFilters([])}>Effacer les filtres</button>}
      </div>
      <p className="mt-3 text-sm text-slate-700" role="status">
        {filters.length ? "Filtre : au moins un repère coché" : "Toutes dimensions confondues"} ·
        {" "}{generalVisible.length}/45 situations générales et {intersectionVisible.length}/16 situations intersectionnelles visibles.
      </p>
      <p className="mt-1 text-xs text-slate-600">Le repérage porte sur le contenu des situations, pas sur l'identité réelle des participants. L'absence d'un repère n'implique pas qu'un personnage n'est pas concerné.</p>
    </fieldset>

    <div className="mt-5 overflow-x-auto rounded-xl border border-slate-300" tabIndex={0} aria-label="Tableau à double entrée des situations générales, défilable horizontalement">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm" data-testid="teacher-general-matrix">
        <caption className="sr-only">Croisement de trois mécanismes et cinq angles pédagogiques, situations V, N et I</caption>
        <thead className="bg-slate-100 text-slate-950"><tr>
          <th scope="col" className="w-36 border-b border-r border-slate-300 p-3">Mécanisme ↓ / Angle →</th>
          {MATRIX_APPROACHES.map(({ id, label }) => <th key={id} scope="col" className="border-b border-r border-slate-300 p-3">{label}</th>)}
        </tr></thead>
        <tbody>
          {MATRIX_FAMILIES.map((family) => <tr key={family.id} className="align-top">
            <th scope="row" className="border-b border-r border-slate-300 bg-slate-50 p-3 font-bold text-blue-950">
              {family.label}<span className="mt-1 block text-xs font-normal text-slate-600">Famille {family.prefix}</span>
            </th>
            {MATRIX_APPROACHES.map((approach) => {
              const entries = matrixGeneralCell(family.id, approach.id, filters);
              return <td key={approach.id} className="border-b border-r border-slate-300 p-3"
                data-matrix-cell={`${family.id}:${approach.id}`}>
                <div className="mb-2 text-xs text-slate-600">{entries.length} situation{entries.length > 1 ? "s" : ""}</div>
                <div className="flex flex-wrap gap-1.5">{entries.map((entry) => codeButton(entry, false))}</div>
                {entries.length === 0 && <span className="text-slate-500" aria-label="Aucune situation">—</span>}
              </td>;
            })}
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className="mt-3 text-sm text-slate-600">
      Les codes <strong>V</strong>, <strong>N</strong> et <strong>I</strong> correspondent aux identifiants des situations.
      Une coche indique une situation déjà présente dans la sélection actuelle lorsque son mode est compatible.
    </p>

    <details className="mt-6 rounded-xl border-2 border-violet-300 bg-violet-50/40 p-4" data-testid="teacher-intersection-matrix">
      <summary className="cursor-pointer text-xl font-bold text-violet-950">Intersectionnalités — vue séparée (16 situations X)</summary>
      <p className="mt-3 text-slate-700">
        Ces situations combinent plusieurs rapports sociaux. Elles appartiennent à une <strong>galerie indépendante</strong>
        avec les personnages XP, et ne peuvent pas être mélangées avec les situations V, N et I dans une même partie.
      </p>
      <p className="mt-2 text-sm text-slate-700">Les deux propositions intersectionnelles constituent des points d'entrée ; les
        situations non présentes dans ces propositions restent visibles. Une situation peut relever des deux propositions.</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-violet-200 bg-white" tabIndex={0} aria-label="Tableau des seize situations intersectionnelles">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">Situations intersectionnelles réparties entre deux propositions et les autres cas</caption>
          <thead><tr>{MATRIX_INTERSECTION_GROUPS.map((group) =>
            <th key={group.id} scope="col" className="border-b border-r border-violet-200 bg-violet-100 p-3 text-violet-950">{group.label}</th>)}</tr></thead>
          <tbody><tr className="align-top">{MATRIX_INTERSECTION_GROUPS.map((group) => {
            const entries = matrixIntersectionGroup(group.id, filters);
            return <td key={group.id} className="border-r border-violet-200 p-3" data-intersection-group={group.id}>
              <p className="mb-2 text-xs text-slate-600">{entries.length} situation{entries.length > 1 ? "s" : ""}</p>
              <div className="flex flex-wrap gap-2">{entries.map((entry) => codeButton(entry, true))}</div>
              {!entries.length && <span className="text-slate-500">—</span>}
            </td>;
          })}</tr></tbody>
        </table>
      </div>
    </details>

    {opened && <aside className="mt-5 rounded-xl border-2 border-blue-600 bg-blue-50 p-5" aria-live="polite" data-testid="teacher-matrix-details">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-800">Fiche {opened.situation.id} · {opened.situation.modeId === "intersectionalities" ? "Intersectionnalités" :
            MATRIX_FAMILIES.find(({ id }) => id === opened.situation.modeId)?.label}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">{opened.situation.title}</h3>
        </div>
        <button type="button" onClick={() => setOpenedId(null)} className="min-h-11 shrink-0 rounded-lg border border-blue-700 bg-white px-3 font-bold text-blue-900">Fermer</button>
      </div>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-800">{opened.situation.playerText}</p>
      <p className="mt-3 text-slate-800"><strong>Mécanisme :</strong> {opened.situation.mechanism}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {opened.tags.dimensions.length ? opened.tags.dimensions.map((id) => {
          const name = MATRIX_DIMENSIONS.find((entry) => entry.id === id)?.label;
          return <span key={id} className="rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-950">{name}</span>;
        }) : <span className="rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-950">Transversale</span>}
        {opened.situation.protective && <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-900">Situation protectrice</span>}
      </div>
      <p className="mt-3 text-sm text-slate-700">Cette vue est un outil de repérage. Pour ajouter ou retirer une situation de la partie, utilisez « Choisir les situations » plus bas ; le mode Découverte donne accès aux familles V, N et I.</p>
    </aside>}
  </section>;
}
