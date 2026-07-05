import { useState } from "react";

import SituationCard from "../components/SituationCard";
import FeedbackCard from "../components/FeedbackCard";

import { situations } from "../data/situations";

interface Props {
  onBackToHome: () => void;
}

type Phase = "question" | "feedback" | "end";

export default function GamePage({ onBackToHome }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [feedback, setFeedback] = useState("");

  const situation = situations[currentIndex];

  function handleChoice(choiceIndex: number) {
    setFeedback(situation.choices[choiceIndex].feedback);
    setPhase("feedback");
  }

  function handleContinue() {
    if (currentIndex < situations.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase("question");
      return;
    }

    setPhase("end");
  }

  function restart() {
    setCurrentIndex(0);
    setFeedback("");
    setPhase("question");
    onBackToHome();
  }

  if (phase === "end") {
    return (
      <main className="mx-auto max-w-2xl p-8 text-center space-y-6">
        <h1 className="text-4xl font-bold">
          Fin de la partie
        </h1>

        <p>
          Merci d'avoir joué à cette première version de Mosaïque.
        </p>

        <button
          onClick={restart}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Rejouer
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">

      {phase === "question" && (
        <SituationCard
          situation={situation}
          onChoice={handleChoice}
        />
      )}

      {phase === "feedback" && (
        <FeedbackCard
          feedback={feedback}
          onContinue={handleContinue}
        />
      )}

    </main>
  );
}
