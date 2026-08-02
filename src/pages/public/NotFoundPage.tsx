import { GAME_HASH, HOME_HASH } from "../../utils/appRoute";

export default function NotFoundPage() {
  return (
    <main className="route-not-found">
      <div>
        <h1>Page introuvable</h1>
        <p>Cette page n’existe pas.</p>
        <p><a href={HOME_HASH}>Accueil</a> · <a href={GAME_HASH}>Jouer</a></p>
      </div>
    </main>
  );
}
