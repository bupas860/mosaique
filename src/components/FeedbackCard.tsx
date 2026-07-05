interface Props {
  feedback: string;
  onContinue: () => void;
}

export default function FeedbackCard({
  feedback,
  onContinue,
}: Props) {
  return (
    <div className="space-y-6">

      <p className="text-lg">
        {feedback}
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
