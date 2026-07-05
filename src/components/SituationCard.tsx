import type { Situation } from "../types/situation";

interface Props {
  situation: Situation;
  onChoice: (choiceIndex: number) => void;
}

export default function SituationCard({
  situation,
  onChoice,
}: Props) {
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold">
          {situation.title}
        </h2>

        <p className="mt-4">
          {situation.description}
        </p>
      </div>

      <div className="space-y-3">
        {situation.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onChoice(index)}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            {choice.text}
          </button>
        ))}
      </div>

    </div>
  );
}
