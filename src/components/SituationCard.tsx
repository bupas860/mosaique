import type { Choice, SituationContent } from "../types/situation";
import { getChoiceContent } from "../engine/resolveSituationContent";
import Illustration from "./Illustration";

interface Props {
  content: SituationContent;
  situationId: string;
  choices: Choice[];
  characterId: string;
  disabled?: boolean;
  onChoice: (choice: Choice) => void;
}

export default function SituationCard({
  content,
  situationId,
  choices,
  characterId,
  disabled = false,
  onChoice,
}: Props) {
  return (
    <div className="situation-card min-w-0 space-y-6">

      <Illustration
        type="situation"
        id={situationId}
        alt={`Décor de la situation : ${content.title}`}
        fallbackLabel="Décor de la situation"
        className="situation-card__illustration aspect-[5/4] w-full rounded-xl border border-slate-300 shadow-card"
      />

      <div className="situation-card__body">
        <h2 className="text-2xl font-bold">
          {content.title}
        </h2>

        <p className="mt-4 break-words">
          {content.description}
        </p>

        <p className="mt-6 break-words text-lg font-semibold">
          {content.question ?? "Cette situation constitue-t-elle un obstacle pour ton personnage ?"}
        </p>
      </div>

      <div className="space-y-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            disabled={disabled}
            onClick={() => onChoice(choice)}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-opacity hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {getChoiceContent(choice, characterId).text}
          </button>
        ))}
      </div>

    </div>
  );
}
