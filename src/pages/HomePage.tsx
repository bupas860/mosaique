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
          <div className="home-hero__visual" aria-hidden="true">
            <img
              src={activeHomeHero}
              alt=""
              width="1672"
              height="941"
              decoding="async"
              fetchPriority="high"
              className="home-hero__image"
            />
          </div>
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
            </div>
          </div>
        </section>

        <aside className="home-introduction">
          <div className="home-introduction__inner">
            <h2 className="text-xl font-bold text-slate-900">Comment se déroule une partie&nbsp;?</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Vous allez parcourir 10 situations tirées au hasard. Pour chacune, vous devrez faire un choix et observer ses effets sur votre personnage.
            </p>
          </div>
        </aside>
      </AppBackground>
    </Screen>
  );
}
