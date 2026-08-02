import { useLayoutEffect } from "react";
import reperesJson from "../../data/public/publicReperes.generated.json";
import type { PublicRepere } from "../../data/public/publicReference.types";
import type { AppRoute } from "../../utils/appRoute";
import { repereHash } from "../../utils/appRoute";
import PublicRichText, { PublicInline } from "../reference/PublicRichText";

const reperes = reperesJson.reperes as readonly PublicRepere[];
type Route = Extract<AppRoute, { kind: "reperes" | "repere-detail" }>;

function ReperesIndex() {
  return <main className="reference-page"><header><h1>Repères</h1></header><ol className="reference-index reference-index--five">{reperes.map((repere) => <li key={repere.id}><article><p className="reference-id">{repere.id}</p><h2>{repere.title}</h2><p>{repere.introduction}</p><a href={repereHash(repere.id)}>Lire ce repère</a></article></li>)}</ol></main>;
}

function RepereDetail({ repere }: { repere: PublicRepere }) {
  const index = reperes.findIndex(({ id }) => id === repere.id);
  const linkTargets = Object.fromEntries(repere.continueLinks.map(({ label, target }) => [label, target]));
  return <main className="reference-page reference-detail">
    <p><a href="#/reperes">Retour aux Repères</a></p>
    <header><p className="reference-id">{repere.id}</p><h1>{repere.title}</h1><p>{repere.introduction}</p><aside className="reference-callout"><h2>En bref</h2><p>{repere.inBrief}</p></aside></header>
    {repere.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><PublicRichText blocks={section.blocks} /></section>)}
    <section><h2>Pour continuer</h2><p><PublicInline text={repere.continueText.replace(/^\*\*Pour continuer :\*\* /, "")} links={linkTargets} /></p></section>
    <section><h2>Mots utiles</h2><ul>{repere.usefulWords.map((word) => <li key={word.id}><a href={word.target}>{word.label}</a></li>)}</ul></section>
    <nav className="reference-sequence" aria-label="Repères précédent et suivant">{index > 0 ? <a href={repereHash(reperes[index - 1].id)}>Repère précédent : {reperes[index - 1].title}</a> : <span />}{index < reperes.length - 1 ? <a href={repereHash(reperes[index + 1].id)}>Repère suivant : {reperes[index + 1].title}</a> : null}</nav>
  </main>;
}

export default function ReperesApp({ route }: { route: Route }) {
  const repere = route.kind === "repere-detail" ? reperes.find(({ id }) => id === route.repereId) : undefined;
  useLayoutEffect(() => { document.title = repere ? `${repere.title} — Repères — Mosaïque` : "Repères — Mosaïque"; requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true })); }, [repere]);
  return repere ? <RepereDetail repere={repere} /> : <ReperesIndex />;
}
