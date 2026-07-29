import type { MovementDecision } from "../types/editorialV2";
import type { EditorialSituationIdV2 } from "../types/editorialV2";
import type { PlayerSituationContentV2 } from "../types/runtimeV2";
import { getSituationIllustrationV2 } from "../data/v2/situationIllustrationsV2";
import { personalizePlayerText } from "../utils/personalizePlayerText";
import Illustration from "./Illustration";
interface Props { situation: PlayerSituationContentV2; situationId: EditorialSituationIdV2; characterName: string; disabled?: boolean; showChoices?: boolean; onDecision: (decision: MovementDecision) => void; }
export default function SituationCard({ situation, situationId, characterName, disabled = false, showChoices = true, onDecision }: Props) {
  const title = personalizePlayerText(situation.title, characterName);
  const text = personalizePlayerText(situation.text, characterName);
  const question = personalizePlayerText(situation.question, characterName);
  const illustration = getSituationIllustrationV2(situationId);
  return <div className="situation-card min-w-0 space-y-6">
    <Illustration type="situation" id={situationId} source={illustration?.source ?? null} alt={illustration?.alt ?? `Illustration de la situation : ${title}`} fallbackLabel="Illustration à venir" className="situation-card__illustration aspect-[5/4] w-full rounded-xl border border-slate-300 shadow-card" />
    <div className="situation-card__body"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-4 break-words">{text}</p><p className="mt-6 break-words text-lg font-semibold">{question}</p></div>
    {showChoices && <div className="space-y-3"><button type="button" disabled={disabled} onClick={() => onDecision("advance")} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-opacity hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{characterName} avance</button><button type="button" disabled={disabled} onClick={() => onDecision("stay")} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-opacity hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{characterName} reste sur place</button></div>}
  </div>;
}
