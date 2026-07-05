import Button from "../components/Button";
import Screen from "../components/Screen";

type HomePageProps = {
  onStart: () => void;
};

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <Screen>
      <div className="space-y-8 text-center">

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
