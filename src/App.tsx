import { useState } from "react";

import GamePage from "./pages/GamePage";

type Screen = "home" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "game") {
    return (
      <GamePage
        onBackToHome={() => setScreen("home")}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center p-8 text-center">

      <h1 className="mb-6 text-5xl font-bold">
        Mosaïque
      </h1>

      <p className="mb-10 text-lg">
        Explorer les situations, réfléchir à ses choix,
        apprendre autrement.
      </p>

      <button
        onClick={() => setScreen("game")}
        className="rounded-lg bg-blue-600 px-8 py-4 text-white hover:bg-blue-700"
      >
        Commencer
      </button>

    </main>
  );
}
