import Button from "../components/Button";
import Screen from "../components/Screen";

type HomePageProps = {
  onStart: () => void;
};

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <Screen>
      <div className="w-full max-w-3xl space-y-8 p-4 text-center sm:p-8">

        <h1 className="text-5xl font-bold">
          La marge des privilèges
        </h1>

        <p className="text-xl text-slate-600">
          Un jeu de réflexion sur les
          <br />
          privilèges et les inégalités.
        </p>

        <Button onClick={onStart}>
          Commencer
        </Button>

      </div>
    </Screen>
  );
}
