import Button from "../components/Button";
import AppBackground from "../components/AppBackground";
interface Props { onContinue: () => void; onBack: () => void; }
export default function HowToPlayPage({ onContinue, onBack }: Props) {
  return <AppBackground as="main"><div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center space-y-8 p-4 sm:p-8">
    <header className="space-y-3 text-center"><h1 className="text-4xl font-bold sm:text-5xl">Comment jouer&nbsp;?</h1><p className="text-lg text-slate-700">Vous allez parcourir 10 situations tirées au hasard en incarnant un personnage.</p></header>
    <section className="app-surface space-y-5 rounded-2xl border p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-bold">Une marche pour observer les inégalités</h2><p className="leading-relaxed text-slate-700">Votre personnage avance lorsque la situation ne lui crée pas de difficulté particulière. Il reste sur place lorsqu’elle le freine, l’expose, l’exclut ou lui impose un effort supplémentaire.</p><p className="leading-relaxed text-slate-700">Après chaque réponse, le jeu vous présente une interprétation pédagogique. Certaines situations peuvent être discutées&nbsp;: le jeu propose une lecture argumentée, et non une vérité sur toutes les personnes.</p></section>
    <div className="flex flex-col-reverse items-stretch justify-center gap-3 sm:flex-row sm:items-center"><Button variant="secondary" onClick={onBack}>Retour à l’accueil</Button><Button onClick={onContinue}>Continuer</Button></div>
  </div></AppBackground>;
}
