import type { Choice, SituationContent } from "../types/situation";
import Illustration from "./Illustration";

interface Props {
  content: SituationContent;
  situationId: string;
  choices: Choice[];
  characterName: string;
  disabled?: boolean;
  showChoices?: boolean;
  onChoice: (choice: Choice) => void;
}

export default function SituationCard({
  content,
  situationId,
  choices,
  characterName,
  disabled = false,
  showChoices = true,
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
          Dans cette situation, que se passe-t-il pour {characterName}&nbsp;?
        </p>
      </div>

      {showChoices && (
        <div className="space-y-3">
          {choices.map((choice) => (
          <button
            key={choice.id}
            disabled={disabled}
            onClick={() => onChoice(choice)}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-opacity hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {choice.id === "yes" ? `${characterName} reste sur place` : `${characterName} avance`}
          </button>
          ))}
        </div>
      )}

    </div>
  );
}
