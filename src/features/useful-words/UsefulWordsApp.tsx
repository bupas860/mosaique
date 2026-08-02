import { useLayoutEffect } from "react";
import wordsJson from "../../data/public/publicUsefulWords.generated.json";
import type { PublicUsefulWord } from "../../data/public/publicReference.types";
import type { AppRoute, UsefulWordContext } from "../../utils/appRoute";
import { repereHash, usefulWordHash } from "../../utils/appRoute";
import { PublicInline } from "../reference/PublicRichText";

const words = wordsJson.words as readonly PublicUsefulWord[];
type Route = Extract<AppRoute, { kind: "useful-words" | "useful-word-detail" }>;

function WordsIndex() {
  const group = (title: string, values: readonly PublicUsefulWord[]) => <section><h2>{title}</h2><ol className="reference-index">{values.map((word) => <li key={word.id}><article><p className="reference-id">{word.id}</p><h3>{word.label}</h3><p>{word.inBrief}</p><a href={usefulWordHash(word.id, { type: "index" })}>Lire la définition</a></article></li>)}</ol></section>;
  return <main className="reference-page"><header><h1>Les mots utiles</h1></header>{group("Mots et parcours", words.slice(0, 15))}{group("Autres mots utiles", words.slice(15))}</main>;
}

function contextReturn(context?: UsefulWordContext): { href: string; label: string } {
  if (context?.type === "situation") return { href: `#/situations/${context.code}`, label: `Retour à la situation ${context.code}` };
  if (context?.type === "journey") return { href: "#/personnages/mots-et-parcours", label: "Retour à Mots et parcours" };
  if (context?.type === "repere") return { href: repereHash(context.id), label: "Retour au Repère" };
  return { href: "#/mots-utiles", label: "Retour aux mots utiles" };
}

function WordDetail({ word, context }: { word: PublicUsefulWord; context?: UsefulWordContext }) {
  const back = contextReturn(context);
  return <main className="reference-page reference-detail"><p><a className="context-return" href={back.href}>{back.label}</a></p><header><p className="reference-id">{word.id}</p><h1>{word.label}</h1><p>{word.inBrief}</p></header>
    <section><h2>Exemple</h2><p>{word.example}</p></section>
    <section><h2>À ne pas confondre</h2><p>{word.notConfuse}</p></section>
    <section><h2>À retenir</h2><p>{word.remember}</p></section>
    <section><h2>Espaces d’utilisation</h2><ul>{word.usageSpaces.map((space) => <li key={space}>{space}</li>)}</ul></section>
    <section><h2>Contenu daté</h2><p>{word.datedNote}</p></section>
    {word.publicSources.length > 0 ? <section><h2>Sources publiques</h2><ul>{word.publicSources.map((source) => <li key={source}><PublicInline text={source} /></li>)}</ul></section> : null}
    {word.relatedRepereIds.length > 0 ? <section><h2>Repères associés</h2><ul>{word.relatedRepereIds.map((id) => <li key={id}><a href={repereHash(id)}>{id}</a></li>)}</ul></section> : null}
    <p><a href="#/mots-utiles">Voir les 25 mots utiles</a></p>
  </main>;
}

export default function UsefulWordsApp({ route }: { route: Route }) {
  const word = route.kind === "useful-word-detail" ? words.find(({ id }) => id === route.wordId) : undefined;
  useLayoutEffect(() => { document.title = word ? `${word.label} — Les mots utiles — Mosaïque` : "Les mots utiles — Mosaïque"; requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true })); }, [word]);
  return word ? <WordDetail word={word} context={route.kind === "useful-word-detail" ? route.context : undefined} /> : <WordsIndex />;
}
