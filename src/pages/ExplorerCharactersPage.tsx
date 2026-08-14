import { useEffect } from "react";
import AppBackground from "../components/AppBackground";
import CharacterPortrait from "../components/CharacterPortrait";
import CharacterPublicTags from "../components/CharacterPublicTags";
import { publicBiographiesV2 } from "../data/v2/publicBiographiesV2";
import { characterBiographyHash, isEleaContext } from "../utils/appRoute";

const SCROLL_KEY = "mosaique:explorer-characters-scroll";

export default function ExplorerCharactersPage() {
  const eleaPresentation = isEleaContext();
  useEffect(() => {
    const saved = Number(sessionStorage.getItem(SCROLL_KEY));
    if (Number.isFinite(saved) && saved > 0) requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: "auto" }));
  }, []);

  function rememberPosition() {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  }

  const groups = [
    { id: "general", title: "Galerie générale" },
    { id: "intersectional", title: "Galerie Intersectionnalités" },
  ] as const;

  return (
    <AppBackground as="main" className="explorer-page">
      <div className="explorer-page__inner">
        {!eleaPresentation && <a href="#/" className="app-text-link">Retour à l’accueil</a>}
        <header className="explorer-header">
          <p className="explorer-eyebrow">Explorer</p>
          <h1>Personnages</h1>
          <p>Découvrez les parcours approfondis des dix-sept personnages fictifs de Mosaïque.</p>
          <p><a href="#/personnages/mots-et-parcours" className="app-text-link">Mots et parcours</a></p>
          {!eleaPresentation && <p><a href="#/personnages/quiz" className="app-text-link">Quiz Personnages</a></p>}
        </header>
        {groups.map((group) => (
          <section key={group.id} className="explorer-gallery" aria-labelledby={`gallery-${group.id}`}>
            <h2 id={`gallery-${group.id}`}>{group.title}</h2>
            <div className="explorer-gallery__grid">
              {publicBiographiesV2.filter(({ gallery }) => gallery === group.id).map((biography) => (
                <article key={biography.id} className="explorer-character-card" style={{ "--character-accent": biography.gallery === "general" ? "#2563A9" : "#6D4CC3" } as React.CSSProperties}>
                  <CharacterPortrait characterId={biography.id} characterName={biography.name} image={biography.image} alt={biography.portraitAlt} accentColor={biography.gallery === "general" ? "#2563A9" : "#6D4CC3"} size="card" className="explorer-character-card__portrait" />
                  <div className="explorer-character-card__content">
                    <h3>{biography.name}</h3>
                    <p className="explorer-character-card__metadata">{biography.age} ans · {biography.schoolLevel}</p>
                    <p className="explorer-character-card__gallery">{biography.galleryLabel} · <span>{biography.id}</span></p>
                    <CharacterPublicTags characterId={biography.id} className="explorer-character-card__tags" />
                    <p className="explorer-character-card__description">{biography.shortDescription}</p>
                    <a href={characterBiographyHash(biography.id)} onClick={rememberPosition} className="explorer-character-card__link">Découvrir son parcours<span className="sr-only"> — {biography.name}, {biography.galleryLabel}, {biography.id}</span></a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppBackground>
  );
}
