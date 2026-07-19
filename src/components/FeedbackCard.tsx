interface Props {
  feedback: string;
  characterName: string;
  onContinue: () => void;
}

export default function FeedbackCard({
  feedback,
  characterName,
  onContinue,
}: Props) {
  return (
    <div className="space-y-6">

      <p className="text-lg">
        {feedback}
      </p>

      <p className="text-sm text-slate-600">
        Vous incarnez toujours {characterName}.
      </p>

      <button
        onClick={onContinue}
        className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
      >
        Continuer
      </button>

    </div>
  );
}
