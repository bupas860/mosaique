import { useRef, useState } from "react";
import AppBackground from "../components/AppBackground";
import BiographyContentBlocks from "../components/BiographyContentBlocks";
import CharacterPortrait from "../components/CharacterPortrait";
import CharacterPublicTags from "../components/CharacterPublicTags";
import { publicBiographiesV2, type RuntimePublicBiography } from "../data/v2/publicBiographiesV2";
import { EXPLORER_CHARACTERS_HASH, GAME_HASH, characterBiographyHash, type CharacterBiographyContext } from "../utils/appRoute";

const groups = [
  { id: "overview", title: "Vue d’ensemble", sections: [1, 2, 11, 12] },
  { id: "journey", title: "Son parcours", sections: [3, 4, 5, 9] },
  { id: "privacy", title: "Entourage et confidentialité", sections: [6, 7, 8, 13] },
  { id: "school", title: "Au lycée", sections: [10] },
] as const;

interface Props { biography: RuntimePublicBiography; context?: CharacterBiographyContext; }

export default function CharacterBiographyPage({ biography, context }: Props) {
  const [activeGroupId, setActiveGroupId] = useState<(typeof groups)[number]["id"]>("overview");
  const [openSectionNumber, setOpenSectionNumber] = useState<number>(groups[0].sections[0]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const biographyIndex = publicBiographiesV2.findIndex(({ id }) => id === biography.id);
  const previous = biographyIndex > 0 ? publicBiographiesV2[biographyIndex - 1] : undefined;
  const next = biographyIndex < publicBiographiesV2.length - 1 ? publicBiographiesV2[biographyIndex + 1] : undefined;
  const activeGroupIndex = groups.findIndex(({ id }) => id === activeGroupId);
  const activeGroup = groups[activeGroupIndex] ?? groups[0];
  const returnLink = context?.type === "game"
    ? { href: GAME_HASH, label: "Retour à la partie" }
    : context?.type === "game-preparation"
      ? { href: GAME_HASH, label: "Retour à la préparation de la partie" }
      : { href: EXPLORER_CHARACTERS_HASH, label: "Retour aux personnages" };

  function activateTab(index: number) {
    const normalizedIndex = (index + groups.length) % groups.length;
    setActiveGroupId(groups[normalizedIndex].id);
    setOpenSectionNumber(groups[normalizedIndex].sections[0]);
    requestAnimationFrame(() => tabRefs.current[normalizedIndex]?.focus({ preventScroll: true }));
  }

  function selectTab(index: number) {
    setActiveGroupId(groups[index].id);
    setOpenSectionNumber(groups[index].sections[0]);
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowLeft") { event.preventDefault(); activateTab(index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); activateTab(index + 1); }
    if (event.key === "Home") { event.preventDefault(); activateTab(0); }
    if (event.key === "End") { event.preventDefault(); activateTab(groups.length - 1); }
  }

  return (
    <AppBackground as="main" className="biography-page">
      <div className="biography-page__inner">
        <a href={returnLink.href} className="app-text-link">{returnLink.label}</a>
        <div className="biography-layout">
          <header className="biography-profile" style={{ "--character-accent": biography.gallery === "general" ? "#2563A9" : "#6D4CC3" } as React.CSSProperties}>
            <CharacterPortrait characterId={biography.id} characterName={biography.name} image={biography.image} alt={biography.portraitAlt} accentColor={biography.gallery === "general" ? "#2563A9" : "#6D4CC3"} size="card" eager className="biography-profile__portrait" />
            <div className="biography-profile__content">
              <h1>{biography.name}</h1>
              <p className="biography-profile__metadata">{biography.age} ans · {biography.schoolLevel}</p>
              <CharacterPublicTags characterId={biography.id} className="biography-profile__tags" />
              <p className="biography-profile__description">{biography.shortDescription}</p>
              <p className="biography-profile__words"><a href="#/personnages/mots-et-parcours">Mots et parcours</a></p>
            </div>
          </header>
          <section className="biography-tabs" aria-label="Biographie détaillée">
            <div role="tablist" aria-label="Rubriques de la biographie" className="biography-tabs__list">
              {groups.map((group, index) => {
                const selected = group.id === activeGroupId;
                return <button key={group.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`biography-tab-${group.id}`} aria-selected={selected} aria-controls={`biography-panel-${group.id}`} tabIndex={selected ? 0 : -1} onClick={() => selectTab(index)} onKeyDown={(event) => handleTabKeyDown(event, index)}>{group.title}</button>;
              })}
            </div>
            {groups.map((group) => (
              <div key={group.id} role="tabpanel" id={`biography-panel-${group.id}`} aria-labelledby={`biography-tab-${group.id}`} hidden={group.id !== activeGroup.id} className="biography-tabs__panel">
                {group.id === "privacy" && <p className="biography-privacy-reminder">Les personnes informées varient selon les espaces. Lire cette fiche ne rend pas ces informations publiques dans l’histoire.</p>}
                <div className="biography-subsections">
                <div className="biography-subsection-headers">
                {group.sections.map((number) => {
                  const section = biography.sections.find((candidate) => candidate.number === number);
                  if (!section) throw new Error(`Rubrique publique absente : ${biography.id}/${number}`);
                  const open = group.id === activeGroupId && number === openSectionNumber;
                  const buttonId = `biography-section-button-${group.id}-${number}`;
                  const panelId = `biography-section-panel-${group.id}-${number}`;
                  return <div key={number} className={`biography-subsection${open ? " biography-subsection--open" : ""}`}>
                    <h2><button type="button" id={buttonId} aria-expanded={open} aria-controls={panelId} onClick={() => setOpenSectionNumber(number)}><span>{section.title}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button></h2>
                  </div>;
                })}
                </div>
                <div className="biography-subsection-panels">
                {group.sections.map((number) => {
                  const section = biography.sections.find((candidate) => candidate.number === number);
                  if (!section) throw new Error(`Rubrique publique absente : ${biography.id}/${number}`);
                  const open = group.id === activeGroupId && number === openSectionNumber;
                  const buttonId = `biography-section-button-${group.id}-${number}`;
                  const panelId = `biography-section-panel-${group.id}-${number}`;
                  return <div key={number} role="region" id={panelId} aria-labelledby={buttonId} hidden={!open} className="biography-subsection__panel"><BiographyContentBlocks blocks={section.blocks} /></div>;
                })}
                </div>
                </div>
              </div>
            ))}
          </section>
        </div>
        <nav className="biography-sequence" aria-label="Personnages précédent et suivant">
          {previous ? <a href={characterBiographyHash(previous.id, context)}>Personnage précédent : {previous.name}</a> : <span />}
          {next ? <a href={characterBiographyHash(next.id, context)}>Personnage suivant : {next.name}</a> : null}
        </nav>
        <a href={returnLink.href} className="app-text-link biography-back-link">{returnLink.label}</a>
      </div>
    </AppBackground>
  );
}
