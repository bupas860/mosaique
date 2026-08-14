import { useEffect, useRef, useState } from "react";
import type { MovementDecision } from "../types/editorialV2";
import type { EditorialSituationIdV2 } from "../types/editorialV2";
import type { PlayerSituationContentV2 } from "../types/runtimeV2";
import { getSituationIllustrationV2 } from "../data/v2/situationIllustrationsV2";
import { personalizePlayerText } from "../utils/personalizePlayerText";
import Illustration from "./Illustration";
interface Props { situation: PlayerSituationContentV2; situationId: EditorialSituationIdV2; characterName: string; disabled?: boolean; showChoices?: boolean; onDecision: (decision: MovementDecision) => void; }
export default function SituationCard({ situation, situationId, characterName, disabled = false, showChoices = true, onDecision }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const helpButton = useRef<HTMLButtonElement>(null);
  const title = personalizePlayerText(situation.title, characterName);
  const text = personalizePlayerText(situation.text, characterName);
  const illustration = getSituationIllustrationV2(situationId);
  useEffect(() => { setHelpOpen(false); }, [situationId]);
  useEffect(() => {
    if (!helpOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setHelpOpen(false); helpButton.current?.focus({ preventScroll: true }); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [helpOpen]);
  return <div className="situation-card min-w-0 space-y-6">
    <Illustration type="situation" id={situationId} source={illustration?.source ?? null} alt={illustration?.alt ?? `Illustration de la situation : ${title}`} fallbackLabel="Illustration à venir" className="situation-card__illustration aspect-[5/4] w-full rounded-xl border border-slate-300 shadow-card" />
    <div className="situation-card__body"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-4 break-words">{text}</p>{showChoices ? <div className="game-decision-heading"><p id="game-decision-question" className="break-words text-lg font-semibold">Pour {characterName}, cette situation constitue-t-elle un obstacle&nbsp;?</p><button ref={helpButton} type="button" className="game-movement-help-button" aria-label="Comprendre ce que signifie avancer ou rester sur place" aria-expanded={helpOpen} aria-controls="game-movement-help" onClick={() => setHelpOpen((open) => !open)}><span aria-hidden="true">ⓘ</span></button><div id="game-movement-help" role="note" hidden={!helpOpen} className="game-movement-help-popover">Avancer signifie que cette situation ne réduit pas la marge de manœuvre du personnage. Rester sur place signifie qu’elle constitue ici un obstacle.</div></div> : null}</div>
    {showChoices && <div className="game-decision-options" role="group" aria-labelledby="game-decision-question"><button type="button" disabled={disabled} onClick={() => onDecision("stay")}>Oui — {characterName} reste sur place</button><button type="button" disabled={disabled} onClick={() => onDecision("advance")}>Non — {characterName} avance</button></div>}
  </div>;
}
