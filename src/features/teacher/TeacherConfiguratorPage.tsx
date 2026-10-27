import { useMemo, useState } from "react";
import AppBackground from "../../components/AppBackground";
import { gameModes } from "../../data/gameModes";
import { createActiveGameSet, getActiveCharactersForMode, type ActiveGameModeIdV2 } from "../../data/v2/activeModesRuntimeV2";
import type { EditorialCharacterIdV2, EditorialSituationIdV2 } from "../../types/editorialV2";
import {
  teacherSessionUrl, teacherSituationsForMode, validateTeacherSession, type TeacherSessionV1,
} from "./teacherConfig";

const groupLabels: Readonly<Record<string, string>> = {
  "visible-obstacles": "Obstacles visibles",
  "ordinary-norms": "Normes ordinaires",
  "invisible-effects": "Effets invisibles",
  intersectionalities: "Intersectionnalités",
};

function startingSituations(mode: ActiveGameModeIdV2): EditorialSituationIdV2[] {
  const character = getActiveCharactersForMode(mode)[0];
  return [...createActiveGameSet(mode, character.id).situationIds];
}

export default function TeacherConfiguratorPage() {
  const [mode, setMode] = useState<ActiveGameModeIdV2>("discovery");
  const [chosenCharacters, setChosenCharacters] = useState<EditorialCharacterIdV2[]>(
    () => getActiveCharactersForMode("discovery").map(({ id }) => id),
  );
  const [chosenSituations, setChosenSituations] = useState<EditorialSituationIdV2[]>(
    () => startingSituations("discovery"),
  );
  const [copied, setCopied] = useState(false);

  const characters = useMemo(() => getActiveCharactersForMode(mode), [mode]);
  const situations = useMemo(() => teacherSituationsForMode(mode), [mode]);
  const session: TeacherSessionV1 = {
    version: 1, mode, situationIds: chosenSituations, characterIds: chosenCharacters,
  };
  let shareUrl = "";
  let problem = "";
  try {
    validateTeacherSession(session);
    shareUrl = teacherSessionUrl(session);
  } catch (error) {
    problem = error instanceof Error ? error.message : "Sélection incomplète.";
  }

  function changeMode(nextMode: ActiveGameModeIdV2) {
    setMode(nextMode);
    setChosenCharacters(getActiveCharactersForMode(nextMode).map(({ id }) => id));
    setChosenSituations(startingSituations(nextMode));
    setCopied(false);
  }

  function toggleCharacter(id: EditorialCharacterIdV2) {
    setChosenCharacters((previous) => previous.includes(id) ? previous.filter((current) => current !== id) : [...previous, id]);
    setCopied(false);
  }

  function toggleSituation(id: EditorialSituationIdV2) {
    setChosenSituations((previous) => previous.includes(id)
      ? previous.filter((current) => current !== id)
      : previous.length < 10 ? [...previous, id] : previous);
    setCopied(false);
  }

  async function copyUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      const field = document.querySelector<HTMLInputElement>("#teacher-session-url");
      field?.focus();
      field?.select();
      setCopied(false);
    }
  }

  return <AppBackground as="main" className="teacher-configurator">
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-12">
      <header className="max-w-3xl space-y-3">
        <p><a href="#/" className="font-semibold text-blue-800 underline">← Retour à l'accueil</a></p>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Espace de préparation · Expérimental</p>
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Préparer une séance</h1>
        <p className="text-lg leading-relaxed text-slate-700">Choisissez les situations et les personnages que vos élèves pourront rencontrer. Vous obtiendrez un lien à leur transmettre, sans compte et sans donnée personnelle.</p>
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"><strong>Version d'essai :</strong> chaque partie comporte dix situations, comme dans le jeu d'origine. Les choix sont enregistrés dans le lien, et non sur un serveur. Ce lien ne masque pas le corpus public disponible ailleurs dans l'application.</p>
      </header>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="teacher-mode-heading">
        <h2 id="teacher-mode-heading" className="text-2xl font-bold text-slate-950">1. Choisir un mode</h2>
        <p className="mb-4 mt-2 text-slate-700">Un mode détermine les catégories de situations et les personnages proposés.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gameModes.filter((item) => item.available).map((item) =>
            <label key={item.id} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 ${mode === item.id ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-400"}`}>
              <input type="radio" name="teacher-game-mode" value={item.id} className="mt-1 h-5 w-5 accent-blue-700" checked={mode === item.id} onChange={() => changeMode(item.id as ActiveGameModeIdV2)} />
              <span><strong className="block text-slate-950">{item.title}</strong><span className="mt-1 block text-sm text-slate-700">{item.description}</span></span>
            </label>,
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="teacher-characters-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="teacher-characters-heading" className="text-2xl font-bold text-slate-950">2. Choisir les personnages</h2>
          <span className="font-semibold text-blue-800">{chosenCharacters.length} / {characters.length} autorisés</span>
        </div>
        <p className="my-3 text-slate-700">Les élèves pourront choisir uniquement parmi les personnages cochés. Conservez-en au moins un.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => <label key={character.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-3 hover:bg-slate-50">
            <input type="checkbox" className="h-5 w-5 accent-blue-700" checked={chosenCharacters.includes(character.id)} onChange={() => toggleCharacter(character.id)} />
            <span><strong className="block text-slate-950">{character.name}</strong><small className="text-slate-600">{character.age} ans · {character.schoolLevel}</small></span>
          </label>)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="teacher-situations-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="teacher-situations-heading" className="text-2xl font-bold text-slate-950">3. Choisir les situations</h2>
          <strong className="rounded-full bg-blue-100 px-4 py-2 text-blue-900" aria-live="polite">{chosenSituations.length} / 10 choisies</strong>
        </div>
        <p className="mt-3 text-slate-700">Dix situations distinctes sont nécessaires. Pour remplacer une situation, décochez-la avant d'en sélectionner une autre.</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {situations.map((situation) => {
            const selected = chosenSituations.includes(situation.id);
            return <label key={situation.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${selected ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-300"}`}>
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-blue-700" checked={selected} disabled={!selected && chosenSituations.length === 10} onChange={() => toggleSituation(situation.id)} />
              <span className="min-w-0">
                <span className="block text-xs font-bold text-slate-600">{situation.id} · {groupLabels[situation.modeId]}</span>
                <strong className="mt-1 block text-slate-950">{situation.title}</strong>
                <span className="mt-2 block text-sm leading-relaxed text-slate-700">{situation.playerText}</span>
                {situation.protective && <span className="mt-2 inline-block rounded bg-teal-100 px-2 py-1 text-xs font-bold text-teal-900">Situation protectrice</span>}
              </span>
            </label>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-teal-600 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="teacher-share-heading">
        <h2 id="teacher-share-heading" className="text-2xl font-bold text-slate-950">4. Partager la séance</h2>
        {problem ? <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-950" role="status">{problem}</p> : <>
          <p className="mt-3 text-slate-700">Ce lien ouvre le jeu avec uniquement vos personnages et situations sélectionnés. Le même lien peut être transmis aux élèves ou intégré dans Éléa.</p>
          <label htmlFor="teacher-session-url" className="mb-1 mt-4 block font-semibold text-slate-800">Lien de la séance</label>
          <input id="teacher-session-url" className="w-full rounded-lg border border-slate-400 bg-slate-50 p-3 text-sm text-slate-900" type="text" value={shareUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={copyUrl} className="min-h-11 rounded-lg bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">{copied ? "Lien copié ✓" : "Copier le lien"}</button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-blue-700 px-5 py-3 font-bold text-blue-800 hover:bg-blue-50">Tester cette séance ↗</a>
          </div>
          <p className="mt-4 text-sm text-slate-600">Aucune information n'est envoyée à un serveur pour créer le lien. Les décisions prises dans une partie restent sur le navigateur utilisé.</p>
        </>}
      </section>
    </div>
  </AppBackground>;
}
