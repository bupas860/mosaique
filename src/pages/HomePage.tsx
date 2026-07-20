import Button from "../components/Button";
import Screen from "../components/Screen";

type HomePageProps = {
  onStart: () => void;
};

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <Screen>
      <div className="relative isolate flex min-h-screen w-full items-center overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-8 lg:px-12">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_#2563eb_0,_transparent_38%),radial-gradient(circle_at_bottom_right,_#0f766e_0,_transparent_34%)] opacity-60" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/40 via-slate-950/80 to-slate-950" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-7 text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Mosaïque</p>
            <h1 className="text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
              La marge des privilèges
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-200 lg:mx-0">
              Incarnez un personnage et découvrez comment une même situation peut produire des conséquences différentes selon son parcours, son identité et sa place dans la société.
            </p>
            <div>
              <Button onClick={onStart}>Commencer une partie</Button>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur sm:p-8">
            <div aria-hidden="true" className="mb-6 flex aspect-[16/8] items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/5 text-sm font-semibold text-slate-300">
              Espace réservé à l’illustration du jeu
            </div>
            <h2 className="text-xl font-bold">Comment se déroule une partie&nbsp;?</h2>
            <p className="mt-3 leading-relaxed text-slate-200">
              Vous allez parcourir 10 situations tirées au hasard. Pour chacune, vous devrez faire un choix et observer ses effets sur votre personnage.
            </p>
          </aside>
        </div>
      </div>
    </Screen>
  );
}
