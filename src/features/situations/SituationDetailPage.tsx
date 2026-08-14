import { useRef, useState } from "react";
import { publicSituations } from "../../data/public/publicSituations.generated";
import ContinueLink from "./ContinueLink";
import PublicSituationImage from "./PublicSituationImage";
import UsefulWordList from "./UsefulWordList";

const tabs = [
  { id: "understand", title: "Comprendre" },
  { id: "help", title: "Ce qui peut aider" },
  { id: "other", title: "Un autre angle" },
] as const;

function Paragraphs({ values }: { values: readonly string[] }) {
  return <>{values.map((value) => <p key={value}>{value}</p>)}</>;
}

export default function SituationDetailPage({ code }: { code: string }) {
  const situation = publicSituations.find((item) => item.code === code);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("understand");
  const [openSection, setOpenSection] = useState("observe");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!situation) return null;

  const understandSections = [
    { id: "observe", title: "Ce qui se joue ici", values: situation.observe },
    { id: "why", title: "Pourquoi cela compte", values: situation.whyItMatters },
    { id: "angle", title: "Angle d’analyse", values: situation.focalAnalysis },
  ];
  function activateTab(index: number) {
    const normalized = (index + tabs.length) % tabs.length;
    setActiveTab(tabs[normalized].id);
    setOpenSection("observe");
    requestAnimationFrame(() => tabRefs.current[normalized]?.focus({ preventScroll: true }));
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowLeft") { event.preventDefault(); activateTab(index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); activateTab(index + 1); }
    if (event.key === "Home") { event.preventDefault(); activateTab(0); }
    if (event.key === "End") { event.preventDefault(); activateTab(tabs.length - 1); }
  }

  return (
    <main className={`public-situation-detail public-situation-detail--focal-${situation.focalId.toLowerCase()}`}>
      <p className="public-situation-breadcrumb"><a href="#/situations">Retour aux situations</a></p>
      <div className="public-situation-detail__layout">
        <header className="public-situation-context">
          <PublicSituationImage code={situation.code} filename={situation.illustrationFile} altText={situation.altText} eager />
          <div className="public-situation-context__content">
            <h1 tabIndex={-1} data-situations-route-heading>{situation.title}</h1>
            <p className="public-situation-card__labels"><span className={`public-badge public-badge--focal-${situation.focalId.toLowerCase()}`}>{situation.focalLabel}</span><span className={`public-badge public-badge--${situation.role}`}>{situation.role === "obstacle" ? "Obstacle" : "Protection"}</span></p>
            <section aria-labelledby="situation-scene-title"><h2 id="situation-scene-title">La situation présentée dans le jeu</h2><p className="public-situation-canonical">{situation.canonicalText}</p></section>
            <section aria-labelledby="situation-words-title"><h2 id="situation-words-title">Mots utiles</h2><UsefulWordList words={situation.usefulWords} situationCode={situation.code} /></section>
          </div>
        </header>
        <section className="public-situation-analysis" aria-label="Analyse de la situation">
          <div role="tablist" aria-label="Rubriques d’analyse" className="public-situation-tabs">
            {tabs.map((tab, index) => {
              const selected = activeTab === tab.id;
              return <button key={tab.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`situation-tab-${tab.id}`} aria-selected={selected} aria-controls={`situation-panel-${tab.id}`} tabIndex={selected ? 0 : -1} onClick={() => { setActiveTab(tab.id); setOpenSection("observe"); }} onKeyDown={(event) => handleTabKeyDown(event, index)}>{tab.title}</button>;
            })}
          </div>
          <div role="tabpanel" id="situation-panel-understand" aria-labelledby="situation-tab-understand" hidden={activeTab !== "understand"} className="public-situation-tabpanel">
            <div className="public-disclosure-headers">
              {understandSections.map((section) => {
                const open = openSection === section.id;
                return <h2 key={section.id} className={open ? "public-disclosure-heading public-disclosure-heading--open" : "public-disclosure-heading"}><button type="button" id={`situation-disclosure-${section.id}`} aria-expanded={open} aria-controls={`situation-disclosure-panel-${section.id}`} onClick={() => setOpenSection(section.id)}><span>{section.title}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button></h2>;
              })}
            </div>
            <div className="public-disclosure-panels">
              {understandSections.map((section) => <div key={section.id} role="region" id={`situation-disclosure-panel-${section.id}`} aria-labelledby={`situation-disclosure-${section.id}`} hidden={openSection !== section.id} className="public-disclosure-panel"><Paragraphs values={section.values} /></div>)}
            </div>
          </div>
          <div role="tabpanel" id="situation-panel-help" aria-labelledby="situation-tab-help" hidden={activeTab !== "help"} className="public-situation-tabpanel"><h2>Ce qui peut aider</h2><Paragraphs values={situation.protectiveContent} /></div>
          <div role="tabpanel" id="situation-panel-other" aria-labelledby="situation-tab-other" hidden={activeTab !== "other"} className="public-situation-tabpanel"><h2>Un autre angle</h2><Paragraphs values={situation.otherReading} /></div>
        </section>
      </div>
      <section className="public-situation-continue-section"><h2>Continuer</h2><ContinueLink destination={situation.continueTarget} /></section>
    </main>
  );
}
