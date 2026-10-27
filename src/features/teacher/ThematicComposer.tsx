import { useMemo, useState } from "react";
import {
  composeThematicMix, presetsForGallery, type MixGallery, type ThematicMix,
} from "./thematicMix";

type Props = {
  readonly onApply: (mix: ThematicMix, fillRemaining: boolean) => void;
};

export default function ThematicComposer({ onApply }: Props) {
  const [gallery, setGallery] = useState<MixGallery>("general");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fillRemaining, setFillRemaining] = useState(false);
  const [warning, setWarning] = useState("");

  const presets = useMemo(() => presetsForGallery(gallery), [gallery]);
  const requestedCount = presets.reduce((sum, preset) => sum + (quantities[preset.id] ?? 0), 0);
  const remaining = Math.max(0, 10 - requestedCount);

  function changeGallery(next: MixGallery) {
    setGallery(next);
    setQuantities({});
    setWarning("");
  }

  function changeCount(id: string, value: number) {
    const count = Math.min(10, Math.max(0, Number.isFinite(value) ? Math.trunc(value) : 0));
    setQuantities((previous) => ({ ...previous, [id]: count }));
    setWarning("");
  }

  function apply() {
    try {
      const proposal = composeThematicMix(gallery, quantities);
      onApply(proposal, fillRemaining);
      setWarning("");
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Impossible de composer ces situations.");
    }
  }

  return <div className="mt-8 border-t border-slate-300 pt-7" aria-labelledby="teacher-mixer-heading">
    <h3 id="teacher-mixer-heading" className="text-xl font-bold text-slate-950">Ou composer une séance avec plusieurs thématiques</h3>
    <p className="mt-2 text-slate-700">
      Par exemple, sélectionnez <strong>2</strong> situations dans « Comprendre les mécanismes »,
      <strong> 1</strong> dans « Paroles, actes et réactions » et <strong>2</strong> dans
      « Représentations et invisibilisation ». Vous pourrez compléter les cinq places restantes
      manuellement ou automatiquement.
    </p>

    <fieldset className="mt-5">
      <legend className="font-bold text-slate-900">Familles de situations à composer</legend>
      <div className="mt-2 flex flex-wrap gap-3">
        <label className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 ${gallery === "general" ? "border-blue-700 bg-blue-50" : "border-slate-300"}`}>
          <input type="radio" name="teacher-mix-gallery" value="general" checked={gallery === "general"} onChange={() => changeGallery("general")} />
          Obstacles visibles, normes et effets invisibles
        </label>
        <label className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 ${gallery === "intersectionalities" ? "border-blue-700 bg-blue-50" : "border-slate-300"}`}>
          <input type="radio" name="teacher-mix-gallery" value="intersectionalities" checked={gallery === "intersectionalities"} onChange={() => changeGallery("intersectionalities")} />
          Intersectionnalités
        </label>
      </div>
    </fieldset>
    <p className="mt-3 text-sm text-slate-700">
      Les situations des trois premières familles peuvent être mélangées en mode Découverte.
      Les situations intersectionnelles utilisent d'autres personnages ; elles se composent entre elles,
      dans leur propre mode.
    </p>

    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {presets.map((preset) => {
        const count = quantities[preset.id] ?? 0;
        const max = 10 - (requestedCount - count);
        return <div key={preset.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-950">{preset.title}</h4>
            <p className="mt-1 text-sm text-slate-700">{preset.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2" role="group" aria-label={`Nombre de situations de ${preset.title}`}>
            <button type="button" className="h-11 w-11 rounded-lg border border-slate-400 bg-white text-xl font-bold" aria-label={`Retirer une situation de ${preset.title}`} disabled={count === 0} onClick={() => changeCount(preset.id, count - 1)}>−</button>
            <output className="min-w-8 text-center text-xl font-bold text-blue-950" aria-label={`${count} situations`}>{count}</output>
            <button type="button" className="h-11 w-11 rounded-lg border border-slate-400 bg-white text-xl font-bold" aria-label={`Ajouter une situation de ${preset.title}`} disabled={count >= max} onClick={() => changeCount(preset.id, count + 1)}>+</button>
          </div>
        </div>;
      })}
    </div>

    <div className="mt-5 rounded-xl border border-blue-300 bg-blue-50 p-4">
      <p className="text-lg font-bold text-blue-950" aria-live="polite">
        <span data-testid="teacher-mix-total">{requestedCount}</span> / 10 situations réparties · {remaining} places restantes
      </p>
      <label className="mt-3 flex cursor-pointer items-start gap-3 text-slate-800">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-blue-700" checked={fillRemaining} onChange={(event) => setFillRemaining(event.target.checked)} />
        <span><strong>Compléter automatiquement jusqu'à dix</strong> avec d'autres situations du même mode.
          Vous pourrez ensuite toutes les modifier.
        </span>
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={apply} disabled={requestedCount === 0}
          className="min-h-11 rounded-lg bg-blue-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          Composer ma sélection
        </button>
        <button type="button" onClick={() => { setQuantities({}); setWarning(""); }}
          className="min-h-11 rounded-lg border border-slate-500 bg-white px-4 py-3 font-semibold">
          Remettre les compteurs à zéro
        </button>
      </div>
      {warning && <p className="mt-3 rounded-lg border border-amber-400 bg-amber-50 p-3 text-amber-950" role="alert">{warning}</p>}
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        Si une même situation appartient à deux propositions, elle n'est jamais comptée deux fois.
        Les situations sont tirées au sein des propositions choisies : le résultat constitue une
        <strong> base de séance modifiable</strong>, et non un parcours imposé.
      </p>
    </div>
  </div>;
}
