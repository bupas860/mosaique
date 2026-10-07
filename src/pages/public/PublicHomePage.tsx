import { illustrations } from "../../assets/illustrations/illustrations";
import AppBackground from "../../components/AppBackground";
import { PUBLIC_PARCOURS } from "../../utils/publicIdentity";

export default function PublicHomePage() {
  return <AppBackground as="main" className="home-page public-activity-home">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero__visual" aria-hidden="true" style={{ backgroundImage: `url("${illustrations.homeHero.active}")` }} />
      <div className="home-hero__shade" aria-hidden="true" />
      <div className="home-hero__content">
        <h1 id="home-title" className="home-hero__title">La marche des privilèges</h1>
        <div className="home-hero__paths" aria-hidden="true" />
        <p className="home-hero__intro">Incarnez un personnage et observez comment des situations ordinaires peuvent réduire ou élargir sa marge de manœuvre.</p>
        <div className="home-hero__action"><a className="home-primary-link" href="#/jouer">Commencer une partie</a></div>
      </div>
    </section>
    <aside className="home-introduction">
      <div className="home-introduction__inner">
        <p className="font-semibold text-slate-900">Parcours actuel : {PUBLIC_PARCOURS}</p>
        <p className="mt-2 leading-relaxed text-slate-700">Cette version se concentre sur les LGBTI-phobies, les orientations, les identités et expressions de genre, ainsi que leurs intersections avec d’autres rapports sociaux. L’application est conçue pour accueillir d’autres parcours thématiques.</p>
        <h2 className="mt-6 text-xl font-bold text-slate-900">Comment se déroule une partie&nbsp;?</h2>
        <p className="mt-3 leading-relaxed text-slate-700">Vous parcourez 10 situations en incarnant un personnage. Après chaque choix, une comparaison présente votre lecture et une interprétation proposée, sans note ni classement.</p>
      </div>
    </aside>
  </AppBackground>;
}
