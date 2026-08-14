import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { publicDocumentTitle } from "../../utils/publicIdentity";
import reperesJson from "../../data/public/publicReperes.generated.json";
import type { PublicRepere, PublicRepereSection, PublicTextBlock } from "../../data/public/publicReference.types";
import type { AppRoute } from "../../utils/appRoute";
import { repereHash } from "../../utils/appRoute";
import PublicRichText from "../reference/PublicRichText";

const reperes = reperesJson.reperes as readonly PublicRepere[];
type Route = Extract<AppRoute, { kind: "reperes" | "repere-detail" }>;

function publicRepereWording(value: string): string {
  return value
    .replaceAll("Un personnage de Mosaïque est", "Dans la marche des privilèges, un personnage est")
    .replaceAll("Dans Mosaïque", "Dans la marche des privilèges")
    .replaceAll("Exemple dans Mosaïque", "Exemple dans l’activité")
    .replaceAll("Ce que Mosaïque transforme", "Ce que cette version transforme")
    .replaceAll("Une scène de Mosaïque", "Une scène de la marche des privilèges")
    .replaceAll("par Mosaïque", "dans l’activité")
    .replaceAll("choisi dans l’activité", "retenu dans l’activité")
    .replaceAll("Mosaïque vous", "La marche des privilèges vous")
    .replaceAll("Mosaïque s’inspire", "La marche des privilèges s’inspire")
    .replaceAll("Mosaïque reprend", "Cette version reprend")
    .replaceAll("Mosaïque conserve", "Cette version conserve")
    .replaceAll("Mosaïque fait", "La marche des privilèges fait")
    .replaceAll("Mosaïque", "la marche des privilèges");
}

function projectedBlocks(blocks: readonly PublicTextBlock[]): readonly PublicTextBlock[] {
  return blocks
    .filter(({ text }) => text !== "---")
    .map((block) => ({
      ...block,
      label: block.label ? publicRepereWording(block.label) : undefined,
      text: block.text ? publicRepereWording(block.text) : undefined,
      items: block.items?.map(publicRepereWording),
    }));
}

function ProjectedSections({ sections }: { sections: readonly PublicRepereSection[] }) {
  return <>{sections.map((section) => <section key={section.title} className="reference-deep-section"><h4>{publicRepereWording(section.title)}</h4><PublicRichText blocks={projectedBlocks(section.blocks)} /></section>)}</>;
}

function RepereContent({ repere }: { repere: PublicRepere }) {
  const [deepOpen, setDeepOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const sourceSections = repere.sections.filter(({ title }) => title === "Sources principales et mise à jour");
  const deepSections = repere.sections.filter(({ title }) => title !== "Sources principales et mise à jour");
  const deepButtonId = `repere-deep-button-${repere.routeSegment}`;
  const deepPanelId = `repere-deep-panel-${repere.routeSegment}`;
  const sourcesButtonId = `repere-sources-button-${repere.routeSegment}`;
  const sourcesPanelId = `repere-sources-panel-${repere.routeSegment}`;
  return <div className="reference-accordion__content">
    <div className="reference-primary"><PublicRichText blocks={projectedBlocks(repere.primaryBlocks)} /></div>
    {deepSections.length > 0 ? <div className="reference-secondary-disclosure"><h3><button type="button" id={deepButtonId} aria-expanded={deepOpen} aria-controls={deepPanelId} onClick={() => setDeepOpen((open) => !open)}><span>Approfondir</span><span aria-hidden="true">{deepOpen ? "−" : "+"}</span></button></h3><div id={deepPanelId} role="region" aria-labelledby={deepButtonId} hidden={!deepOpen} className="reference-secondary-disclosure__panel"><ProjectedSections sections={deepSections} /></div></div> : null}
    {sourceSections.length > 0 ? <div className="reference-secondary-disclosure"><h3><button type="button" id={sourcesButtonId} aria-expanded={sourcesOpen} aria-controls={sourcesPanelId} onClick={() => setSourcesOpen((open) => !open)}><span>Sources</span><span aria-hidden="true">{sourcesOpen ? "−" : "+"}</span></button></h3><div id={sourcesPanelId} role="region" aria-labelledby={sourcesButtonId} hidden={!sourcesOpen} className="reference-secondary-disclosure__panel"><ProjectedSections sections={sourceSections} /></div></div> : null}
    <section className="reference-compact-links" aria-labelledby={`repere-words-${repere.routeSegment}`}><h3 id={`repere-words-${repere.routeSegment}`}>Mots utiles</h3><ul>{repere.usefulWords.map((word) => <li key={word.id}><a href={word.target}>{word.label}</a></li>)}</ul></section>
    <section className="reference-compact-links" aria-labelledby={`repere-continue-${repere.routeSegment}`}><h3 id={`repere-continue-${repere.routeSegment}`}>Pour continuer</h3><ul>{repere.continueLinks.map((link) => <li key={link.target}><a href={link.target}>{link.label === "Personnages" ? "Découvrir les personnages" : link.label === "Situations" ? "Explorer les situations" : link.label}</a></li>)}</ul></section>
  </div>;
}

export default function ReperesApp({ route }: { route: Route }) {
  const routeRepere = route.kind === "repere-detail" ? reperes.find(({ id }) => id === route.repereId) : undefined;
  const [openId, setOpenId] = useState(routeRepere?.id ?? reperes[0].id);
  const activatedButtonRef = useRef<{ button: HTMLButtonElement; top: number } | null>(null);
  const activeRepere = reperes.find(({ id }) => id === openId) ?? reperes[0];
  useEffect(() => { setOpenId(routeRepere?.id ?? reperes[0].id); }, [routeRepere]);
  useLayoutEffect(() => {
    const activated = activatedButtonRef.current;
    if (!activated) return;
    const displacement = activated.button.getBoundingClientRect().top - activated.top;
    if (Math.abs(displacement) > 1) window.scrollBy(0, displacement);
    activated.button.focus({ preventScroll: true });
    activatedButtonRef.current = null;
  }, [openId]);
  useLayoutEffect(() => { document.title = route.kind === "repere-detail" ? publicDocumentTitle("Repères", activeRepere.publicTitle) : publicDocumentTitle("Repères"); }, [activeRepere.publicTitle, route.kind]);
  return <main className="reference-page reference-page--compact">
    <header><h1>Repères</h1><p>Quelques clés pour comprendre la marche des privilèges et les notions utilisées dans l’activité.</p></header>
    <div className="reference-accordions">{reperes.map((repere, index) => {
      const open = repere.id === activeRepere.id;
      const buttonId = `repere-button-${repere.routeSegment}`;
      const panelId = `repere-panel-${repere.routeSegment}`;
      return <section key={repere.id} className={`reference-accordion${open ? " reference-accordion--open" : ""}`}><h2><button type="button" id={buttonId} aria-expanded={open} aria-controls={panelId} onClick={(event) => { activatedButtonRef.current = { button: event.currentTarget, top: event.currentTarget.getBoundingClientRect().top }; setOpenId(repere.id); }}><span>{repere.publicTitle}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button></h2><div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open} className="reference-accordion__panel">{open ? <><RepereContent repere={repere} /><nav className="reference-sequence" aria-label="Repères précédent et suivant">{index > 0 ? <a href={repereHash(reperes[index - 1].id)}>Repère précédent : {reperes[index - 1].publicTitle}</a> : <span />}{index < reperes.length - 1 ? <a href={repereHash(reperes[index + 1].id)}>Repère suivant : {reperes[index + 1].publicTitle}</a> : null}</nav></> : null}</div></section>;
    })}</div>
  </main>;
}
