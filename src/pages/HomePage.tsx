import { illustrations } from "../assets/illustrations/illustrations";
import AppBackground from "../components/AppBackground";
import Button from "../components/Button";
import Screen from "../components/Screen";

type HomePageProps = {
  onStart: () => void;
};

export default function HomePage({ onStart }: HomePageProps) {
  const activeHomeHero = illustrations.homeHero.active;

  return (
    <Screen>
      <AppBackground className="home-page">
        <section className="home-hero" aria-labelledby="home-title">
          <div
            className="home-hero__visual"
            aria-hidden="true"
            style={{ backgroundImage: `url("${activeHomeHero}")` }}
          />
          <div className="home-hero__shade" aria-hidden="true" />

          <div className="home-hero__content">
            <h1 id="home-title" className="home-hero__title">
              La marche des privilèges
            </h1>
            <div className="home-hero__paths" aria-hidden="true" />
            <p className="home-hero__intro">
              Incarnez un personnage et découvrez comment une même situation peut produire des conséquences différentes selon son parcours, son identité et sa place dans la société.
            </p>
            <div className="home-hero__action">
              <Button onClick={onStart}>Commencer une partie</Button>
              <a href="#/personnages" className="home-explorer-link"><strong>Explorer</strong><span>Personnages</span></a>
            </div>
          </div>
        </section>

        <aside className="home-introduction">
          <div className="home-introduction__inner">
            <h2 className="text-xl font-bold text-slate-900">Comment se déroule une partie&nbsp;?</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Vous allez parcourir 10 situations tirées au hasard en incarnant un personnage.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              Votre personnage avance lorsque la situation ne lui crée pas de difficulté particulière. Il reste sur place lorsqu’elle le freine, l’expose, l’exclut ou lui impose un effort supplémentaire.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              Après chaque réponse, le jeu vous présente une interprétation pédagogique. Certaines situations peuvent être discutées&nbsp;: le jeu propose une lecture argumentée, et non une vérité sur toutes les personnes.
            </p>
          </div>
        </aside>

        <footer className="home-license">
          © 2026 Pascal Busac — Contenus pédagogiques et illustrations sous licence{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
        </footer>
      </AppBackground>
    </Screen>
  );
}
