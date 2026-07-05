import { useState } from "react";

import GamePage from "./pages/GamePage";
import HomePage from "./pages/HomePage";

export default function App() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <GamePage />;
  }

  return (
    <HomePage
      onStart={() => setStarted(true)}
    />
  );
}
