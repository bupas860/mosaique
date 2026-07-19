import type { Choice, SituationContent } from "../types/situation";
import { getChoiceContent } from "../engine/resolveSituationContent";

interface Props {
  content: SituationContent;
  choices: Choice[];
  characterId: string;
  onChoice: (choice: Choice) => void;
}

export default function SituationCard({
  content,
  choices,
  characterId,
  onChoice,
}: Props) {
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold">
          {content.title}
        </h2>

        <p className="mt-4">
          {content.description}
        </p>
      </div>

      <div className="space-y-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice)}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            {getChoiceContent(choice, characterId).text}
          </button>
        ))}
      </div>

    </div>
  );
}
