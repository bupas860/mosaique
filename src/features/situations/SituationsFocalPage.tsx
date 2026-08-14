import { useState } from "react";
import { publicFocals, publicSituations } from "../../data/public/publicSituations.generated";
import PublicSituationGrid from "./PublicSituationGrid";

function withoutTechnicalCode(value: string): string {
  return value.replace(/^[VNIX]\d{2}\s*[—–-]\s*/, "");
}

export default function SituationsFocalPage({ focalSlug }: { focalSlug: string }) {
  const focal = publicFocals.find((item) => item.slug === focalSlug);
  const [openSection, setOpenSection] = useState("recognize");
  if (!focal) return null;
  const situations = publicSituations.filter((situation) => situation.focalId === focal.id);
  const protections = situations.filter((situation) => situation.role === "protection").length;
  const sections = [
    { id: "recognize", title: "Comment la reconnaître ?", content: focal.recognize.map((paragraph) => <p key={paragraph}>{paragraph}</p>) },
    { id: "example", title: `Exemple — ${withoutTechnicalCode(focal.exampleTitle)}`, content: focal.example.map((paragraph) => <p key={paragraph}>{paragraph}</p>) },
    { id: "not-confuse", title: "À ne pas confondre", content: <p>{focal.notConfuse}</p> },
    { id: "remember", title: "À retenir", content: <p>{focal.remember}</p> },
  ];
  return (
    <main className={`public-situations-page public-focal-page public-focal-page--${focal.id.toLowerCase()}`}>
      <header className="public-situations-intro">
        <p className="public-situation-breadcrumb"><a href="#/situations">Retour vers Toutes les situations</a></p>
        <h1 tabIndex={-1} data-situations-route-heading>{focal.label}</h1>
        <p>{focal.lead}</p>
        <aside className="public-situations-warning"><strong>En bref</strong><p>{focal.inBrief}</p></aside>
      </header>
      <section className="public-focal-depth" aria-labelledby="public-focal-depth-title">
        <h2 id="public-focal-depth-title">Approfondir cette focale</h2>
        <div className="public-disclosure-headers">
          {sections.map((section) => {
            const open = openSection === section.id;
            return <h3 key={section.id} className={open ? "public-disclosure-heading public-disclosure-heading--open" : "public-disclosure-heading"}><button type="button" id={`focal-disclosure-${focal.id}-${section.id}`} aria-expanded={open} aria-controls={`focal-panel-${focal.id}-${section.id}`} onClick={() => setOpenSection(section.id)}><span>{section.title}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button></h3>;
          })}
        </div>
        <div className="public-disclosure-panels">
          {sections.map((section) => <div key={section.id} role="region" id={`focal-panel-${focal.id}-${section.id}`} aria-labelledby={`focal-disclosure-${focal.id}-${section.id}`} hidden={openSection !== section.id} className="public-disclosure-panel">{section.content}</div>)}
        </div>
      </section>
      <section className="public-focal-results" aria-labelledby="public-focal-results-title">
        <header><h2 id="public-focal-results-title">Situations — {focal.label}</h2><p>{situations.length} situations, dont {situations.length - protections} obstacles et {protections} protections.</p></header>
        <PublicSituationGrid situations={situations} showFocal={false} />
      </section>
      <p className="public-situations-back"><a href="#/situations">Voir l’ensemble des situations</a></p>
    </main>
  );
}
