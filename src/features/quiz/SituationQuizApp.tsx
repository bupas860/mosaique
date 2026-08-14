import { useLayoutEffect, useRef, useState } from "react";
import { publicDocumentTitle } from "../../utils/publicIdentity";
import quizJson from "../../data/public/publicSituationQuiz.generated.json";
import type { PublicSituationQuizQuestion } from "../../data/public/publicQuiz.types";
import QuizSituationImage from "./QuizSituationImage";

const quiz = quizJson.quiz as { readonly title: string; readonly meta: string; readonly questions: readonly PublicSituationQuizQuestion[] };
const focals = ["Obstacles visibles", "Normes ordinaires", "Effets invisibles", "Intersectionnalités"];
const roles = ["obstacle", "protection"];
type Phase = "intro" | "focal" | "role" | "feedback" | "result";

export default function SituationQuizApp() {
  const [phase, setPhase] = useState<Phase>("intro"); const [index, setIndex] = useState(0); const [focal, setFocal] = useState(""); const [role, setRole] = useState(""); const [focalResults, setFocalResults] = useState<boolean[]>([]); const [roleResults, setRoleResults] = useState<boolean[]>([]); const [error, setError] = useState("");
  const previousFocusKey = useRef("intro:0");
  const titleRef = useRef<HTMLHeadingElement>(null); const feedbackRef = useRef<HTMLHeadingElement>(null); const question = quiz.questions[index];
  useLayoutEffect(() => { document.title = phase === "feedback" ? publicDocumentTitle("Quiz Situations", question.code, question.title) : publicDocumentTitle("Quiz Situations"); }, [phase, question]);
  useLayoutEffect(() => {
    const focusKey = `${phase}:${index}`;
    if (previousFocusKey.current === focusKey) return;
    previousFocusKey.current = focusKey;
    requestAnimationFrame(() => phase === "feedback" ? feedbackRef.current?.focus({ preventScroll: true }) : document.getElementById("main-content")?.focus({ preventScroll: true }));
  }, [phase, index]);
  const start = () => { setIndex(0); setFocalResults([]); setRoleResults([]); setFocal(""); setRole(""); setError(""); setPhase("focal"); };
  const continueRole = () => { if (!focal) { setError("Choisissez une focale avant de continuer."); return; } setError(""); setPhase("role"); };
  const validate = () => { if (!role) { setError("Choisissez un rôle avant de valider les deux réponses."); return; } setFocalResults((values) => [...values, focal === question.expectedFocal]); setRoleResults((values) => [...values, role === question.expectedRole]); setError(""); setPhase("feedback"); };
  const next = () => { if (index === 7) { setPhase("result"); return; } setIndex((value) => value + 1); setFocal(""); setRole(""); setError(""); setPhase("focal"); };
  if (phase === "intro") return <main className="quiz-page"><p><a href="#/situations">Retour aux situations</a></p><h1>{quiz.title}</h1><p><strong>{quiz.meta}</strong></p><p>Pour chaque scène, retrouvez :</p><ol><li>la focale principale retenue dans l’activité ;</li><li>son rôle principal : obstacle ou protection.</li></ol><p>Vous répondez aux deux étapes, puis vous validez l’ensemble. La correction apparaît ensuite. Vous pouvez la relire sans limite de temps et recommencer exactement la même série.</p><p>Le bilan sépare les <strong>focales retrouvées</strong> et les <strong>rôles obstacle ou protection retrouvés</strong>. Il ne donne ni note ni jugement personnel.</p><aside className="quiz-note">Explorer les situations révèle leur analyse. Vous pouvez donc y trouver des indices pour de prochaines parties.</aside><button type="button" onClick={start}>Commencer le quiz</button></main>;
  if (phase === "result") return <main className="quiz-page"><h1 ref={titleRef} tabIndex={-1}>Bilan du quiz Situations</h1><p className="quiz-result" aria-live="polite">{focalResults.filter(Boolean).length} focales retrouvées sur 8.</p><p className="quiz-result">{roleResults.filter(Boolean).length} rôles obstacle ou protection retrouvés sur 8.</p><p>Ces deux résultats restent séparés. Ils ne sont pas additionnés dans un total général.</p><section><h2>À revoir</h2><ul><li>les situations dont la focale principale n’a pas été retrouvée ;</li><li>les situations dont le rôle obstacle ou protection n’a pas été retrouvé.</li></ul></section><div className="quiz-actions"><a href="#/situations">Revoir les situations concernées</a><a href="#/situations/focales/obstacles-visibles">Ouvrir les quatre introductions de focales</a><button type="button" onClick={start}>Recommencer exactement la même série</button></div></main>;
  return <main className="quiz-page situation-quiz"><p className="quiz-progress">Situation {index + 1} sur 8</p><h1 ref={titleRef} tabIndex={-1}>{phase === "feedback" ? `${question.code} — ${question.title}` : "Quiz Situations"}</h1><QuizSituationImage position={question.position} altText={question.altText} /><div className="quiz-canonical-text">{question.canonicalText.split("\n").map((line) => <p key={line}>{line}</p>)}</div>
    {phase === "focal" ? <form onSubmit={(event) => { event.preventDefault(); continueRole(); }}><fieldset><legend>Quelle est la focale principale retenue dans l’activité ?</legend><p>Une seule réponse attendue</p><div className="quiz-options">{focals.map((label) => <label key={label}><input type="radio" name="focal" checked={focal === label} onChange={() => setFocal(label)} /><span>{label}</span></label>)}</div></fieldset><p role="alert" aria-live="assertive">{error}</p><button type="submit">Continuer</button></form> : null}
    {phase === "role" ? <form onSubmit={(event) => { event.preventDefault(); validate(); }}><fieldset><legend>Quel est le rôle principal de cette scène ?</legend><p>Une seule réponse attendue</p><div className="quiz-options">{roles.map((label) => <label key={label}><input type="radio" name="role" checked={role === label} onChange={() => setRole(label)} /><span>{label}</span></label>)}</div></fieldset><p role="alert" aria-live="assertive">{error}</p><div className="quiz-actions"><button type="button" onClick={() => { setError(""); setPhase("focal"); }}>Revenir à l’étape précédente</button><button type="submit">Valider mes deux réponses</button></div></form> : null}
    {phase === "feedback" ? <section className="quiz-feedback" aria-live="polite"><h2 ref={feedbackRef} tabIndex={-1}>Correction de la situation</h2>{question.feedback.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p><strong>À retenir :</strong> {question.remember}</p><p><a href={`#/situations/${question.code}`}>Ouvrir la fiche {question.code}</a></p><button type="button" onClick={next}>{index === 7 ? "Voir le bilan" : "Situation suivante"}</button></section> : null}
  </main>;
}
