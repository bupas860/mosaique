import { publicSituations } from "../../data/public/publicSituations.generated";
import ContinueLink from "./ContinueLink";
import PublicSituationImage from "./PublicSituationImage";
import UsefulWordList from "./UsefulWordList";

function Paragraphs({ values }: { values: readonly string[] }) {
  return <>{values.map((value) => <p key={value}>{value}</p>)}</>;
}

export default function SituationDetailPage({ code }: { code: string }) {
  const situation = publicSituations.find((item) => item.code === code);
  if (!situation) return null;
  return (
    <main className="public-situation-detail">
      <p className="public-situation-breadcrumb"><a href="#/situations">Situations</a></p>
      <PublicSituationImage code={situation.code} filename={situation.illustrationFile} altText={situation.altText} eager />
      <header><p className="public-situation-detail__code">{situation.code}</p><h1>{situation.title}</h1><p className="public-situation-card__labels"><span>{situation.focalLabel}</span><span>{situation.role === "obstacle" ? "Obstacle" : "Protection"}</span></p></header>
      <section><h2>La situation présentée dans le jeu</h2><p className="public-situation-canonical">{situation.canonicalText}</p></section>
      <section><h2>Ce qu’il faut observer</h2><Paragraphs values={situation.observe} /></section>
      <section><h2>La focale principale de Mosaïque</h2><Paragraphs values={situation.focalAnalysis} /></section>
      <section><h2>Pourquoi cela peut compter</h2><Paragraphs values={situation.whyItMatters} /></section>
      <section><h2>{situation.protectionHeading}</h2><Paragraphs values={situation.protectiveContent} /></section>
      {situation.otherReading.length > 0 ? <section><h2>Une autre lecture possible</h2><Paragraphs values={situation.otherReading} /></section> : null}
      <section><h2>Mots utiles</h2><UsefulWordList words={situation.usefulWords} /></section>
      <section><h2>Continuer</h2><ContinueLink destination={situation.continueTarget} /></section>
    </main>
  );
}
