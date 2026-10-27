import { useMemo, useState } from "react";
import AppBackground from "../../components/AppBackground";
import { getActiveCharactersForMode } from "../../data/v2/activeModesRuntimeV2";
import type { EditorialCharacterIdV2, EditorialSituationIdV2 } from "../../types/editorialV2";
import type { NormalizedRuntimeSituationV2 } from "../../types/runtimeV2";
import {
  decodeTeacherSession,
  teacherSessionUrl,
  teacherSituationsForMode,
  validateTeacherSession,
  type TeacherSessionV1,
} from "./teacherConfig";
import { reviewTeacherSelection } from "./pedagogicalReview";
import { MATRIX_DIMENSIONS, type MatrixDimensionId } from "./situationMatrixData";
import rawTags from "./situationMatrixTaxonomy.json";

type Gallery = "general" | "intersectionalities";
type Stage = "situations" | "characters" | "share";
type Choices = { situationIds: EditorialSituationIdV2[]; characterIds: EditorialCharacterIdV2[] };
type Tags = Readonly<Record<string, { readonly dimensions: readonly MatrixDimensionId[] }>>;

const taxonomy = rawTags as Tags;
const EMPTY: Choices = { situationIds: [], characterIds: [] };
const FAMILY_NAMES: Readonly<Record<string, string>> = {
  "visible-obstacles": "Obstacles visibles",
  "ordinary-norms": "Normes ordinaires",
  "invisible-effects": "Effets invisibles",
  intersectionalities: "Intersectionnalités",
};
const STEP_BUTTONS: { id: Stage; label: string }[] = [
  { id: "situations", label: "1. Situations" },
  { id: "characters", label: "2. Personnages" },
  { id: "share", label: "3. Vérifier et partager" },
];

function normalize(value: string): string {
  return value.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function readEditLink(code?: string) {
  if (!code) return { loaded: undefined, error: false };
  try { return { loaded: decodeTeacherSession(code), error: false }; }
  catch { return { loaded: undefined, error: true }; }
}

export default function TeacherConfiguratorPage({ initialCode }: { readonly initialCode?: string }) {
  const [opening] = useState(() => readEditLink(initialCode));
  const [gallery, setGallery] = useState<Gallery>(
    opening.loaded?.mode === "intersectionalities" ? "intersectionalities" : "general",
  );
  const [allChoices, setAllChoices] = useState<Record<Gallery, Choices>>(() => ({
    general: opening.loaded && opening.loaded.mode !== "intersectionalities"
      ? { situationIds: [...opening.loaded.situationIds], characterIds: [...opening.loaded.characterIds] }
      : { ...EMPTY, situationIds: [], characterIds: [] },
    intersectionalities: opening.loaded?.mode === "intersectionalities"
      ? { situationIds: [...opening.loaded.situationIds], characterIds: [...opening.loaded.characterIds] }
      : { ...EMPTY, situationIds: [], characterIds: [] },
  }));
  const [stage, setStage] = useState<Stage>("situations");
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("all");
  const [dimensionFilters, setDimensionFilters] = useState<MatrixDimensionId[]>([]);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [openedId, setOpenedId] = useState<EditorialSituationIdV2 | null>(null);
  const [copied, setCopied] = useState<"student" | "teacher" | null>(null);

  const mode = gallery === "general" ? "discovery" : "intersectionalities";
  const characters = useMemo(() => getActiveCharactersForMode(mode), [mode]);
  const situations = useMemo(() => teacherSituationsForMode(mode), [mode]);
  const choices = allChoices[gallery];

  const shown = useMemo(() => situations.filter((situation) => {
    if (family !== "all" && situation.modeId !== family) return false;
    if (selectedOnly && !choices.situationIds.includes(situation.id)) return false;
    if (dimensionFilters.length > 0 && !(taxonomy[situation.id]?.dimensions ?? [])
      .some((tag) => dimensionFilters.includes(tag))) return false;
    const text = normalize([
      situation.id, situation.title, situation.playerText, situation.mechanism, situation.subfamily ?? "",
    ].join(" "));
    return text.includes(normalize(search.trim()));
  }), [situations, family, selectedOnly, choices.situationIds, dimensionFilters, search]);

  const session: TeacherSessionV1 = {
    version: 1, mode, situationIds: choices.situationIds, characterIds: choices.characterIds,
  };
  const review = useMemo(
    () => reviewTeacherSelection(session),
    [mode, choices.situationIds, choices.characterIds],
  );

  let link = "";
  let editLink = "";
  try {
    validateTeacherSession(session);
    link = teacherSessionUrl(session);
    editLink = link.replace("#/jouer?seance=", "#/preparer?config=");
  } catch { /* Aucun lien tant que la séance n'est pas complète. */ }

  function update(change: Partial<Choices>) {
    setAllChoices((before) => ({
      ...before,
      [gallery]: { ...before[gallery], ...change },
    }));
    setCopied(null);
  }

  function toggleSituation(id: EditorialSituationIdV2) {
    const previous = choices.situationIds;
    update({ situationIds: previous.includes(id)
      ? previous.filter((item) => item !== id)
      : [...previous, id] });
  }

  function toggleCharacter(id: EditorialCharacterIdV2) {
    const previous = choices.characterIds;
    update({ characterIds: previous.includes(id)
      ? previous.filter((item) => item !== id)
      : [...previous, id] });
  }

  function switchGallery(next: Gallery) {
    if (gallery === next) return;
    setGallery(next);
    setStage("situations");
    setSearch("");
    setFamily("all");
    setDimensionFilters([]);
    setSelectedOnly(false);
    setOpenedId(null);
    setCopied(null);
  }

  function changeStage(next: Stage) {
    setStage(next);
    setOpenedId(null);
    document.getElementById("teacher-stage-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copy(kind: "student" | "teacher") {
    const url = kind === "student" ? link : editLink;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(kind);
    } catch {
      const field = document.querySelector<HTMLInputElement>(
        kind === "student" ? "#teacher-session-url" : "#teacher-edit-url",
      );
      field?.focus();
      field?.select();
    }
  }

  const count = choices.situationIds.length;
  const done = count >= 1 && count <= situations.length && choices.characterIds.length >= 1;
  const protectedCount = choices.situationIds.filter((id) => situations.some((s) => s.id === id && s.protective)).length;

  function situationRow(situation: NormalizedRuntimeSituationV2) {
    const checked = choices.situationIds.includes(situation.id);
    const isOpen = openedId === situation.id;
    const labels = taxonomy[situation.id]?.dimensions
      .map((tag) => MATRIX_DIMENSIONS.find((item) => item.id === tag)?.short).filter(Boolean) ?? [];
    return <tbody key={situation.id} className={checked ? "bg-teal-50" : "bg-white"}>
      <tr className="border-b border-slate-200 hover:bg-slate-50">
        <td className="w-14 px-3 py-3 text-center align-middle">
          <input
            type="checkbox"
            className="h-5 w-5 cursor-pointer accent-teal-700"
            checked={checked}
            onChange={() => toggleSituation(situation.id)}
            aria-label={`${checked ? "Retirer" : "Choisir"} ${situation.id} — ${situation.title}`}
            data-situation-checkbox={situation.id}
          />
        </td>
        <td className="min-w-0 px-2 py-3 align-middle">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button type="button"
              onClick={() => toggleSituation(situation.id)}
              aria-pressed={checked}
              aria-label={`${checked ? "Retirer" : "Choisir"} ${situation.id} — ${situation.title}`}
              data-situation-select={situation.id}
              className="inline-flex min-h-10 flex-wrap items-center gap-2 rounded-lg p-1 text-left hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-700">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-sm font-bold text-slate-900">{situation.id}</span>
              <strong className="text-slate-950 underline-offset-2 hover:underline">{situation.title}</strong>
            </button>
            {situation.protective && <span className="rounded bg-teal-100 px-2 py-1 text-xs font-bold text-teal-950">Protectrice</span>}
          </div>
          <span className="mt-1 block text-xs text-slate-600 sm:hidden">{FAMILY_NAMES[situation.modeId]}</span>
          {labels.length > 0 && <span className="mt-1 block text-xs text-slate-600">{labels.join(" · ")}</span>}
        </td>
        <td className="hidden px-3 py-3 text-sm text-slate-700 sm:table-cell">{FAMILY_NAMES[situation.modeId]}</td>
        <td className="whitespace-nowrap px-2 py-3 text-right align-middle">
          <button type="button" onClick={() => setOpenedId(isOpen ? null : situation.id)}
            aria-expanded={isOpen}
            aria-controls={`teacher-detail-${situation.id}`}
            className="min-h-10 rounded-lg border border-blue-300 bg-white px-3 py-2 font-semibold text-blue-900 hover:bg-blue-50">
            {isOpen ? "Masquer" : "Voir la fiche"}
          </button>
        </td>
      </tr>
      {isOpen && <tr id={`teacher-detail-${situation.id}`} className="border-b border-blue-300 bg-blue-50">
        <td colSpan={4} className="px-4 py-5 sm:px-6" data-testid="teacher-situation-detail">
          <h3 className="text-lg font-bold text-slate-950">{situation.id} — {situation.title}</h3>
          <p className="mt-3 font-bold text-blue-900">Situation telle qu'elle apparaît dans le jeu</p>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-800">{situation.playerText}</p>
          {situation.question && <p className="mt-3 text-slate-800"><strong>Question posée :</strong> {situation.question}</p>}
          <div className="mt-4 rounded-lg border border-blue-200 bg-white p-4">
            <p className="font-bold text-slate-900">Explication pédagogique</p>
            <p className="mt-2 leading-relaxed text-slate-800">{situation.mechanism}</p>
            {situation.interpretation && <p className="mt-2 leading-relaxed text-slate-700">{situation.interpretation}</p>}
            {situation.vigilance && <p className="mt-3 text-amber-950"><strong>Point de vigilance :</strong> {situation.vigilance}</p>}
          </div>
          <button type="button" onClick={() => toggleSituation(situation.id)}
            className={`mt-4 min-h-11 rounded-lg px-5 py-2 font-bold ${checked ? "border-2 border-teal-700 bg-white text-teal-900" : "bg-blue-700 text-white"}`}>
            {checked ? "✓ Retirer de ma séance" : "+ Ajouter à ma séance"}
          </button>
        </td>
      </tr>}
    </tbody>;
  }

  return <AppBackground as="main" className="teacher-configurator">
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-6 sm:px-8 sm:py-10">
      <header className="space-y-3">
        <a href="#/" className="inline-block font-semibold text-blue-800 underline">← Retour à l'accueil</a>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Espace enseignant · Version expérimentale</p>
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Créer ma séance personnalisée</h1>
        <p className="max-w-3xl text-slate-700">Choisissez librement <strong>le nombre de situations souhaité</strong>, puis les <strong>personnages</strong> proposés aux participants. Aucun parcours ni situation n'est imposé.</p>
        {opening.error && <p role="alert" className="rounded-lg border border-red-400 bg-red-50 p-3 text-red-900">Le lien de modification est invalide. Vous pouvez créer une nouvelle séance.</p>}
        {opening.loaded && <p role="status" className="rounded-lg border border-teal-300 bg-teal-50 p-3 text-teal-950">Séance retrouvée depuis votre lien de modification : ses choix sont préremplis.</p>}
      </header>

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-lg font-bold text-slate-950">Quel type de séance ?</h2>
        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Type de séance">
          <button type="button" onClick={() => switchGallery("general")}
            aria-pressed={gallery === "general"}
            data-gallery-tab="general"
            className={`rounded-xl border-2 p-4 text-left ${gallery === "general" ? "border-blue-700 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-500"}`}>
            <strong className="block text-lg text-slate-950">Situations générales</strong>
            <span className="mt-1 block text-sm text-slate-700">45 situations : obstacles visibles, normes ordinaires et effets invisibles, mélangeables librement.</span>
          </button>
          <button type="button" onClick={() => switchGallery("intersectionalities")}
            aria-pressed={gallery === "intersectionalities"}
            data-gallery-tab="intersectionalities"
            className={`rounded-xl border-2 p-4 text-left ${gallery === "intersectionalities" ? "border-violet-700 bg-violet-50" : "border-slate-300 bg-white hover:border-violet-500"}`}>
            <strong className="block text-lg text-slate-950">Intersectionnalités</strong>
            <span className="mt-1 block text-sm text-slate-700">16 situations et 8 personnages spécifiques. Séance distincte, sans mélange avec les 45 autres.</span>
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-600">Vous pouvez passer d'un type à l'autre : vos choix sont conservés séparément pendant cette préparation.</p>
      </div>

      <nav id="teacher-stage-tabs" className="grid gap-2 sm:grid-cols-3" aria-label="Étapes de préparation">
        {STEP_BUTTONS.map((item) => <button key={item.id} type="button" onClick={() => changeStage(item.id)}
          aria-current={stage === item.id ? "step" : undefined}
          data-stage-tab={item.id}
          className={`min-h-12 rounded-xl border-2 px-3 py-3 text-left font-bold ${stage === item.id ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 bg-white text-blue-900 hover:bg-blue-50"}`}>
          {item.label}
          {item.id === "situations" && <span className="ml-2 font-normal">({count})</span>}
          {item.id === "characters" && <span className="ml-2 font-normal">({choices.characterIds.length}/{characters.length})</span>}
        </button>)}
      </nav>

      {stage === "situations" && <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-7" aria-labelledby="teacher-situations-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="teacher-situations-heading" className="text-2xl font-bold text-slate-950">Choisir les situations</h2>
          <strong className={`rounded-full px-4 py-2 ${count > 0 ? "bg-teal-100 text-teal-950" : "bg-blue-100 text-blue-950"}`} aria-live="polite" data-testid="teacher-situation-counter">{count} choisie{count > 1 ? "s" : ""}</strong>
        </div>
        <p className="mt-2 text-slate-700">Cochez la case <strong>ou cliquez sur le numéro ou le titre</strong> pour sélectionner une situation. Cliquez sur <strong>« Voir la fiche »</strong> pour lire l'énoncé complet et son explication.</p>
        <p className="mt-2 text-sm text-slate-700">Au départ, rien n'est précoché. <strong>Une ligne verte signifie « sélectionnée ».</strong> Vous pouvez préparer une séance de 2, 3, 10 situations ou davantage : le choix vous appartient.</p>
        <div className="mt-5 grid gap-3 rounded-xl border border-slate-300 bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <label htmlFor="teacher-search" className="mb-1 block font-semibold">Rechercher une situation</label>
            <input id="teacher-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Numéro, titre, mot..." className="w-full rounded-lg border border-slate-400 bg-white p-3" />
          </div>
          <div>
            <label htmlFor="teacher-family" className="mb-1 block font-semibold">Famille de mécanismes</label>
            <select id="teacher-family" value={family} onChange={(e) => setFamily(e.target.value)}
              className="w-full rounded-lg border border-slate-400 bg-white p-3" disabled={gallery === "intersectionalities"}>
              <option value="all">{gallery === "general" ? "Toutes les familles" : "Intersectionnalités"}</option>
              {gallery === "general" && Object.entries(FAMILY_NAMES).filter(([id]) => id !== "intersectionalities").map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 font-semibold">Repères complémentaires (facultatifs)</legend>
            <div className="flex flex-wrap gap-2">
              {MATRIX_DIMENSIONS.map(({ id, short }) => <label key={id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-blue-700" checked={dimensionFilters.includes(id)}
                  onChange={() => setDimensionFilters((before) => before.includes(id) ? before.filter((item) => item !== id) : [...before, id])} />
                {short}
              </label>)}
            </div>
          </fieldset>
          <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-blue-700" checked={selectedOnly} onChange={(e) => setSelectedOnly(e.target.checked)} />
            <span>Afficher uniquement mes situations cochées</span>
          </label>
          {(search || family !== "all" || dimensionFilters.length || selectedOnly) ? <button type="button"
            className="justify-self-start rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-blue-900 sm:col-span-2"
            onClick={() => { setSearch(""); setFamily("all"); setDimensionFilters([]); setSelectedOnly(false); }}>
            Effacer les filtres
          </button> : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-700" role="status">{shown.length} situation{shown.length > 1 ? "s" : ""} affichée{shown.length > 1 ? "s" : ""} sur {situations.length}.</p>
          {count > 0 && <button type="button" className="min-h-10 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-900 hover:bg-red-50"
            onClick={() => update({ situationIds: [] })}>Tout décocher</button>}
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-300">
          <table className="w-full border-collapse text-left text-sm" data-testid="teacher-situations-table">
            <caption className="sr-only">Liste unique des situations à cocher et à consulter</caption>
            <thead className="bg-slate-100 text-slate-900"><tr>
              <th className="px-3 py-3" scope="col">Choix</th>
              <th className="px-2 py-3" scope="col">Situation</th>
              <th className="hidden px-3 py-3 sm:table-cell" scope="col">Famille</th>
              <th className="px-2 py-3 text-right" scope="col">Détails</th>
            </tr></thead>
            {shown.map((situation) => situationRow(situation))}
          </table>
          {shown.length === 0 && <p className="p-5 text-slate-700">Aucune situation ne correspond aux filtres. Modifiez votre recherche ou effacez les filtres.</p>}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <p className="font-semibold text-slate-800">{count > 0 ? `✓ ${count} situation${count > 1 ? "s" : ""} sélectionnée${count > 1 ? "s" : ""}.` : "Cochez au moins une situation."}</p>
          <button type="button" onClick={() => changeStage("characters")} className="min-h-12 rounded-lg bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">
            Suivant : choisir les personnages →
          </button>
        </div>
      </section>}

      {stage === "characters" && <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-7" aria-labelledby="teacher-characters-heading">
        <h2 id="teacher-characters-heading" className="text-2xl font-bold text-slate-950">Choisir les personnages</h2>
        <p className="mt-2 text-slate-700">Cochez uniquement les personnages que vous souhaitez proposer aux participants. Aucun n'est précoché au départ.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blue-100 px-4 py-2 font-bold text-blue-950" data-testid="teacher-character-counter">{choices.characterIds.length} / {characters.length} cochés</span>
          <button type="button" className="min-h-10 rounded-lg border border-slate-400 bg-white px-3 py-2 font-bold text-blue-900" onClick={() => update({ characterIds: characters.map(({ id }) => id) })}>Tout sélectionner</button>
          <button type="button" className="min-h-10 rounded-lg border border-slate-400 bg-white px-3 py-2 font-bold text-slate-800" onClick={() => update({ characterIds: [] })}>Tout décocher</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => <label key={character.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${choices.characterIds.includes(character.id) ? "border-teal-600 bg-teal-50" : "border-slate-300 bg-white"}`}>
            <input type="checkbox" className="h-5 w-5 accent-teal-700" checked={choices.characterIds.includes(character.id)} onChange={() => toggleCharacter(character.id)} data-character-checkbox={character.id} />
            <span><strong className="block text-slate-950">{character.name}</strong><span className="text-xs text-slate-600">{character.age} ans · {character.schoolLevel}</span></span>
          </label>)}
        </div>
        {choices.characterIds.length === 0 && <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950">Choisissez au moins un personnage pour créer votre lien.</p>}
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={() => changeStage("situations")} className="min-h-12 rounded-lg border border-slate-400 bg-white px-4 py-3 font-bold text-blue-900">← Retour aux situations</button>
          <button type="button" onClick={() => changeStage("share")} className="min-h-12 rounded-lg bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">Suivant : vérifier et partager →</button>
        </div>
      </section>}

      {stage === "share" && <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-7" aria-labelledby="teacher-share-heading">
        <h2 id="teacher-share-heading" className="text-2xl font-bold text-slate-950">Vérifier et partager ma séance</h2>
        <p className="mt-2 text-slate-700">Vérifiez les situations et les personnages choisis avant de générer le lien.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
            <h3 className="text-lg font-bold text-slate-950">Situations : {count} choisie{count > 1 ? "s" : ""}</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-800">{choices.situationIds.map((id) => {
              const situation = situations.find((entry) => entry.id === id);
              return <li key={id}>{id} — {situation?.title ?? id}</li>;
            })}</ol>
            {count === 0 && <p className="mt-2 text-sm text-slate-700">Aucune situation choisie.</p>}
            <button type="button" className="mt-4 font-bold text-blue-900 underline" onClick={() => changeStage("situations")}>Modifier les situations</button>
          </div>
          <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
            <h3 className="text-lg font-bold text-slate-950">Personnages : {choices.characterIds.length}</h3>
            <p className="mt-3 text-sm text-slate-800">{choices.characterIds.map((id) => characters.find((entry) => entry.id === id)?.name).filter(Boolean).join(", ") || "Aucun personnage choisi."}</p>
            <button type="button" className="mt-4 font-bold text-blue-900 underline" onClick={() => changeStage("characters")}>Modifier les personnages</button>
          </div>
        </div>
        {count > 0 && <div className="mt-5 rounded-xl border border-slate-300 bg-white p-4">
          <h3 className="font-bold text-slate-950">Repères pédagogiques <span className="font-normal text-slate-600">(facultatifs)</span></h3>
          <p className="mt-2 text-sm text-slate-700">{protectedCount} situation{protectedCount > 1 ? "s" : ""} protectrice{protectedCount > 1 ? "s" : ""} sur {count}.</p>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold text-blue-900">Voir les équilibres et points de vigilance</summary>
            <div className="mt-3 space-y-2 text-slate-800">
              <p>{Object.entries(review.byFamily).filter(([, total]) => total > 0).map(([key, total]) => `${FAMILY_NAMES[key]} : ${total}`).join(" · ")}</p>
              {review.warnings.length ? <ul className="list-disc space-y-1 pl-5">{review.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul> : <p>Aucun écart relevé avec les principaux critères du tirage habituel.</p>}
              <p className="text-slate-600">Ces points sont indicatifs et ne limitent pas votre liberté de choix. Ils ne constituent pas une validation par âge ou niveau scolaire.</p>
            </div>
          </details>
        </div>}
        {!done && <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950" role="status">
          <strong>Séance incomplète.</strong> Il faut au moins une situation et un personnage.
          Actuellement : {count} situation{count > 1 ? "s" : ""} et {choices.characterIds.length} personnage{choices.characterIds.length > 1 ? "s" : ""}. Revenez aux étapes précédentes pour compléter vos choix.
        </p>}
        {done && <div className="mt-5 rounded-xl border-2 border-teal-500 bg-teal-50 p-5">
          <h3 className="text-xl font-bold text-teal-950">✓ Votre séance est prête</h3>
          <p className="mt-2 text-slate-700">Le lien élève lance la partie avec vos {count} situation{count > 1 ? "s" : ""} et les personnages choisis. Aucun compte n'est nécessaire.</p>
          <label htmlFor="teacher-session-url" className="mb-1 mt-4 block font-bold text-slate-900">Lien élève</label>
          <input id="teacher-session-url" type="text" readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-lg border border-teal-500 bg-white p-3 text-sm text-slate-900" />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={() => copy("student")} className="min-h-11 rounded-lg bg-blue-700 px-5 py-3 font-bold text-white">{copied === "student" ? "Lien copié ✓" : "Copier le lien élève"}</button>
            <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-blue-700 bg-white px-4 py-3 font-bold text-blue-900">Tester la séance ↗</a>
          </div>
          <details className="mt-5 border-t border-teal-300 pt-4">
            <summary className="cursor-pointer font-bold text-blue-900">Conserver un lien pour modifier la séance plus tard</summary>
            <label htmlFor="teacher-edit-url" className="mb-1 mt-3 block text-sm font-semibold text-slate-900">Lien de modification (enseignant)</label>
            <input id="teacher-edit-url" type="text" value={editLink} readOnly onFocus={(e) => e.currentTarget.select()} className="w-full rounded-lg border border-slate-400 bg-white p-3 text-sm" />
            <button type="button" onClick={() => copy("teacher")} className="mt-3 min-h-10 rounded-lg border border-teal-600 bg-white px-4 py-2 font-bold text-teal-900">{copied === "teacher" ? "Lien de modification copié ✓" : "Copier le lien de modification"}</button>
          </details>
          <p className="mt-4 text-sm text-amber-900"><strong>Prévisualisation privée :</strong> le lien Codespaces sert aux tests, pas à une diffusion aux élèves tant que le jeu expérimental n'est pas publié sur une adresse accessible.</p>
        </div>}
        <button type="button" onClick={() => changeStage("situations")} className="mt-5 min-h-11 rounded-lg border border-slate-400 px-4 py-2 font-bold text-blue-900">← Revenir à ma sélection</button>
      </section>}
    </div>
  </AppBackground>;
}
