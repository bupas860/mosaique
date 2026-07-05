import Button from "../components/Button";
import Screen from "../components/Screen";

export default function HomePage() {
  return (
    <Screen>
      <div className="text-center space-y-8">

        <h1 className="text-5xl font-bold">
          La marge des privilèges
        </h1>

        <p className="text-xl text-slate-600">
          Un jeu de réflexion sur les
          <br />
          privilèges et les inégalités.
        </p>

        <Button>
          Commencer
        </Button>

      </div>
    </Screen>
  );
}
