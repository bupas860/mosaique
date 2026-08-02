import { GAME_HASH, PERSONNAGES_HASH, REPERES_HASH, SITUATIONS_HASH } from "../../utils/appRoute";

type HomeEntry = {
  readonly title: string;
  readonly href: string;
  readonly description?: string;
  readonly marker: string;
  readonly primary: boolean;
};

const entries: readonly HomeEntry[] = [
  { title: "Jouer", href: GAME_HASH, description: "Cet espace constitue l’entrée dans l’expérience de jeu.", marker: "▶", primary: true },
  { title: "Personnages", href: PERSONNAGES_HASH, description: "Cet espace donne accès aux 17 personnages et à leurs biographies publiques validées.", marker: "17", primary: false },
  { title: "Situations", href: SITUATIONS_HASH, description: "Cet espace permet d’explorer le corpus public de situations illustrées.", marker: "◆", primary: false },
  { title: "Repères", href: REPERES_HASH, marker: "5", primary: false },
];

export default function PublicHomePage() {
  return (
    <main className="public-home">
      <div className="public-home__intro">
        <h1>Mosaïque</h1>
        <p>Mosaïque aide le lycéen à observer comment une situation ordinaire peut modifier la marge de manœuvre d’une personne.</p>
      </div>
      <div className="public-home__cards" aria-label="Espaces de Mosaïque">
        {entries.map((entry) => (
          <article className={`public-card${entry.primary ? " public-card--primary" : ""}`} key={entry.title}>
            <span className="public-card__marker" aria-hidden="true">{entry.marker}</span>
            <h2><a href={entry.href}>{entry.title}</a></h2>
            {entry.description ? <p>{entry.description}</p> : null}
          </article>
        ))}
      </div>
    </main>
  );
}
