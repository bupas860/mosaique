import Screen from "../components/Screen";

export default function GamePage() {
  return (
    <Screen>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">
          Première situation
        </h1>

        <p className="text-xl text-slate-600">
          Le jeu commence ici...
        </p>
      </div>
    </Screen>
  );
}
