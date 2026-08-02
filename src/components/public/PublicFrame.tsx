import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  GAME_HASH,
  HOME_HASH,
  PERSONNAGES_HASH,
  REPERES_HASH,
  SITUATIONS_HASH,
  type AppRoute,
} from "../../utils/appRoute";

const spaces = [
  { label: "Jouer", href: GAME_HASH, section: "game" },
  { label: "Personnages", href: PERSONNAGES_HASH, section: "personnages" },
  { label: "Situations", href: SITUATIONS_HASH, section: "situations" },
  { label: "Repères", href: REPERES_HASH, section: "reperes" },
] as const;

function activeSection(route: AppRoute): string {
  if (route.kind === "game") return "game";
  if (route.kind === "explorer-characters" || route.kind === "character-biography") return "personnages";
  if (route.kind === "situations") return "situations";
  if (route.kind === "reperes") return "reperes";
  if (route.kind === "home") return "home";
  return "";
}

type PublicFrameProps = {
  route: AppRoute;
  routeKey: string;
  children: ReactNode;
};

export default function PublicFrame({ route, routeKey, children }: PublicFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const current = activeSection(route);

  useEffect(() => setMenuOpen(false), [routeKey]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const links = (mobile: boolean) => (
    <ul className={mobile ? "public-nav__mobile-list" : "public-nav__desktop-list"}>
      {spaces.map((space) => (
        <li key={space.section}>
          <a
            href={space.href}
            aria-current={current === space.section ? "page" : undefined}
            onClick={mobile ? () => setMenuOpen(false) : undefined}
          >
            {space.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main-content">Aller au contenu principal</a>
      <header className="public-header">
        <div className="public-header__inner">
          <a className="public-brand" href={HOME_HASH} aria-current={current === "home" ? "page" : undefined}>Mosaïque</a>
          <nav className="public-nav" aria-label="Navigation principale">
            {links(false)}
            <button
              ref={menuButton}
              className="public-nav__toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="public-mobile-menu"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <div id="public-mobile-menu" className="public-nav__mobile" hidden={!menuOpen}>
              {links(true)}
            </div>
          </nav>
        </div>
      </header>
      <div id="main-content" className="public-content" tabIndex={-1}>{children}</div>
      <footer className="public-footer"><a href={HOME_HASH}>Accueil</a></footer>
    </div>
  );
}
