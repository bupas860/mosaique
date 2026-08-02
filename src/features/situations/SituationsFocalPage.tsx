import { publicFocals, publicSituations } from "../../data/public/publicSituations.generated";
import PublicSituationGrid from "./PublicSituationGrid";

export default function SituationsFocalPage({ focalSlug }: { focalSlug: string }) {
  const focal = publicFocals.find((item) => item.slug === focalSlug);
  if (!focal) return null;
  const situations = publicSituations.filter((situation) => situation.focalId === focal.id);
  const protections = situations.filter((situation) => situation.role === "protection").length;
  return (
    <main className="public-situations-page public-focal-page">
      <header className="public-situations-intro">
        <p className="public-situation-breadcrumb"><a href="#/situations">Situations</a></p>
        <h1>{focal.label}</h1>
        <p>{focal.lead}</p>
        <aside className="public-situations-warning"><strong>En bref</strong><p>{focal.inBrief}</p></aside>
        <h2>Comment la reconnaître ?</h2>
        {focal.recognize.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <h2>Exemple : {focal.exampleTitle}</h2>
        {focal.example.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <aside className="public-situations-warning"><strong>À ne pas confondre</strong><p>{focal.notConfuse}</p></aside>
        <aside className="public-situations-warning"><strong>À retenir</strong><p>{focal.remember}</p></aside>
        <p className="public-situations-counts"><strong>{situations.length} situations</strong><span>{situations.length - protections} obstacles</span><span>{protections} protections</span></p>
      </header>
      <PublicSituationGrid situations={situations} />
      <p className="public-situations-back"><a href="#/situations">Voir l’ensemble des situations</a></p>
    </main>
  );
}
