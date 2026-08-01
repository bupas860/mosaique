import { createRef, useMemo, useState } from "react";
import AppBackground from "../components/AppBackground";
import BiographyAccordion from "../components/BiographyAccordion";
import BiographyContentBlocks from "../components/BiographyContentBlocks";
import CharacterPortrait from "../components/CharacterPortrait";
import CharacterPublicTags from "../components/CharacterPublicTags";
import type { RuntimePublicBiography } from "../data/v2/publicBiographiesV2";
import { EXPLORER_CHARACTERS_HASH } from "../utils/appRoute";

const groups = [
  { id: "overview", title: "Vue d’ensemble", sections: [1, 2, 11, 12] },
  { id: "journey", title: "Son parcours", sections: [3, 4, 5, 9] },
  { id: "privacy", title: "Entourage et confidentialité", sections: [6, 7, 8, 13] },
  { id: "school", title: "Au lycée", sections: [10] },
] as const;

interface Props { biography: RuntimePublicBiography; }

export default function CharacterBiographyPage({ biography }: Props) {
  const [openGroups, setOpenGroups] = useState<Readonly<Record<string, boolean>>>({ overview: true, journey: false, privacy: false, school: false });
  const buttonRefs = useMemo(() => Object.fromEntries(groups.map(({ id }) => [id, createRef<HTMLButtonElement>()])), []);

  function openFromSummary(id: string, event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setOpenGroups((current) => ({ ...current, [id]: true }));
    requestAnimationFrame(() => {
      const button = buttonRefs[id].current;
      button?.focus({ preventScroll: true });
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      button?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  }

  return (
    <AppBackground as="main" className="biography-page">
      <div className="biography-page__inner">
        <a href={EXPLORER_CHARACTERS_HASH} className="app-text-link">Retour aux personnages</a>
        <header className="biography-hero" style={{ "--character-accent": biography.gallery === "general" ? "#2563A9" : "#6D4CC3" } as React.CSSProperties}>
          <CharacterPortrait characterId={biography.id} characterName={biography.name} image={biography.image} alt={biography.portraitAlt} accentColor={biography.gallery === "general" ? "#2563A9" : "#6D4CC3"} size="card" eager className="biography-hero__portrait" />
          <div className="biography-hero__content">
            <h1>{biography.name}</h1>
            <p className="biography-hero__metadata">{biography.age} ans · {biography.schoolLevel}</p>
            <p className="biography-hero__gallery">{biography.galleryLabel} · <span>{biography.id}</span></p>
            <CharacterPublicTags characterId={biography.id} className="biography-hero__tags" />
            <p className="biography-hero__description">{biography.shortDescription}</p>
          </div>
        </header>
        <aside className="biography-narrative-note" aria-labelledby="biography-note-title">
          <h2 id="biography-note-title">À propos de cette fiche</h2>
          <p>Cette fiche donne au lecteur des informations que le lycée fictif, les autres personnages ou l’entourage ne connaissent pas nécessairement. Elles ne doivent pas être utilisées comme si elles étaient publiques dans l’histoire.</p>
        </aside>
        <nav className="biography-summary" aria-label="Sommaire de la fiche">
          <h2>Sommaire de la fiche</h2>
          <ul>{groups.map(({ id, title }) => <li key={id}><a href={`#/explorer/personnages/${biography.id}`} onClick={(event) => openFromSummary(id, event)}>{title}</a></li>)}</ul>
        </nav>
        <div className="biography-accordions">
          {groups.map((group) => (
            <BiographyAccordion key={group.id} id={group.id} title={group.title} open={openGroups[group.id]} buttonRef={buttonRefs[group.id]} onToggle={() => setOpenGroups((current) => ({ ...current, [group.id]: !current[group.id] }))}>
              {group.id === "privacy" && <p className="biography-privacy-reminder">Les personnes informées varient selon les espaces. Lire cette fiche ne rend pas ces informations publiques dans l’histoire.</p>}
              {group.sections.map((number) => {
                const section = biography.sections.find((candidate) => candidate.number === number);
                if (!section) throw new Error(`Rubrique publique absente : ${biography.id}/${number}`);
                return <section key={number} className="biography-canonical-section"><h3>{section.title}</h3><BiographyContentBlocks blocks={section.blocks} /></section>;
              })}
            </BiographyAccordion>
          ))}
        </div>
        <a href={EXPLORER_CHARACTERS_HASH} className="app-text-link biography-back-link">Retour aux personnages</a>
      </div>
    </AppBackground>
  );
}
