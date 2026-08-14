import { useLayoutEffect, useRef, useState } from "react";
import { publicDocumentTitle } from "../../utils/publicIdentity";
import quizJson from "../../data/public/publicCharacterQuiz.generated.json";
import type { PublicCharacterQuizQuestion } from "../../data/public/publicQuiz.types";
import { usefulWordHash } from "../../utils/appRoute";

const quiz = quizJson.quiz as { readonly title: string; readonly meta: string; readonly introduction: string; readonly questions: readonly PublicCharacterQuizQuestion[] };
type Phase = "intro" | "question" | "feedback" | "result" | "review";

function exact(question: PublicCharacterQuizQuestion, selected: readonly string[], associations: Readonly<Record<string, string>>): boolean {
  if (question.responseType === "association") return question.associationPrompts.every(({ id }) => question.expected.some((value) => value.replace(/\.$/, "") === `${id} → ${associations[id]}`));
  return selected.length === question.expected.length && selected.every((value) => question.expected.includes(value));
}

export default function CharacterQuizApp() {
  const [phase, setPhase] = useState<Phase>("intro"); const [index, setIndex] = useState(0); const [selected, setSelected] = useState<string[]>([]); const [associations, setAssociations] = useState<Record<string, string>>({}); const [results, setResults] = useState<boolean[]>([]); const [error, setError] = useState("");
  const feedbackRef = useRef<HTMLHeadingElement>(null); const titleRef = useRef<HTMLHeadingElement>(null); const question = quiz.questions[index];
  useLayoutEffect(() => { document.title = publicDocumentTitle("Quiz Personnages"); }, []);
  const resetAnswer = () => { setSelected([]); setAssociations({}); setError(""); };
  const start = () => { setIndex(0); setResults([]); resetAnswer(); setPhase("question"); requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true })); };
  const validate = () => {
    const complete = question.responseType === "association" ? question.associationPrompts.every(({ id }) => associations[id]) : selected.length > 0;
    if (!complete) { setError(question.responseType === "association" ? "Répondez aux trois associations avant de valider." : "Choisissez au moins une réponse avant de valider."); return; }
    setResults((values) => [...values, exact(question, selected, associations)]); setPhase("feedback"); requestAnimationFrame(() => feedbackRef.current?.focus({ preventScroll: true }));
  };
  const next = () => { if (index === quiz.questions.length - 1) { setPhase("result"); requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true })); return; } setIndex((value) => value + 1); resetAnswer(); setPhase("question"); requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true })); };
  const toggle = (id: string) => setSelected((values) => question.responseType === "multiple" ? values.includes(id) ? values.filter((value) => value !== id) : [...values, id] : [id]);
  const recognized = question.responseType === "association" ? question.associationPrompts.filter(({ id }) => question.expected.some((value) => value.replace(/\.$/, "") === `${id} → ${associations[id]}`)).map(({ id }) => id) : selected.filter((id) => question.expected.includes(id));
  const toReview = question.responseType === "association" ? question.associationPrompts.filter(({ id }) => !recognized.includes(id)).map(({ id }) => id) : question.options.filter(({ id }) => selected.includes(id) !== question.expected.includes(id)).map(({ id }) => id);

  if (phase === "intro") return <main className="quiz-page"><p><a href="#/personnages">Retour aux personnages</a></p><h1>{quiz.title}</h1><p><strong>{quiz.meta}</strong></p><p>{quiz.introduction}</p><p>Votre résultat sera formulé en <strong>« repères retrouvés »</strong>. Il n’y a ni note, ni classement, ni jugement personnel.</p><aside className="quiz-note">Les questions portent sur les mots et les parcours présentés dans l’espace Personnages. Elles ne vous demandent aucune information sur vous.</aside><button type="button" onClick={start}>Commencer le quiz</button></main>;
  if (phase === "result" || phase === "review") {
    const score = results.filter(Boolean).length;
    return <main className="quiz-page"><h1 ref={titleRef} tabIndex={-1}>{score} repères retrouvés sur 8</h1><p>Les huit questions correspondent à huit repères de compréhension. Vous pouvez relire les explications des questions et retrouver les notions associées à celles qui restent à revoir.</p>{phase === "review" ? <div className="quiz-review">{quiz.questions.map((item) => <section key={item.id}><h2>{item.title}</h2><p>{item.feedback}</p><p><strong>À retenir :</strong> {item.remember}</p></section>)}</div> : <section><h2>Notions à relire</h2><ul>{quiz.questions.filter((_, itemIndex) => !results[itemIndex]).flatMap((item) => item.usefulWords).filter((word, itemIndex, values) => values.findIndex(({ id }) => id === word.id) === itemIndex).map((word) => <li key={word.id}><a href={usefulWordHash(word.id)}>{word.label}</a></li>)}</ul></section>}<div className="quiz-actions"><a href="#/personnages/mots-et-parcours">Ouvrir Mots et parcours</a><button type="button" onClick={() => setPhase(phase === "review" ? "result" : "review")}>{phase === "review" ? "Retour au bilan" : "Revoir les corrections"}</button><button type="button" onClick={start}>Recommencer le quiz</button></div></main>;
  }
  return <main className="quiz-page"><p className="quiz-progress">Question {index + 1} sur 8</p><h1 ref={titleRef} tabIndex={-1}>{question.title}</h1>{question.introduction !== "Aucune." ? <p>{question.introduction}</p> : null}<p className="quiz-question">{question.question}</p><p>{question.instruction}</p>
    {phase === "question" ? <form onSubmit={(event) => { event.preventDefault(); validate(); }}>{question.responseType === "association" ? <div>{question.associationPrompts.map((prompt) => <label key={prompt.id} className="quiz-association"><span>{prompt.label}</span><select value={associations[prompt.id] ?? ""} onChange={(event) => setAssociations((values) => ({ ...values, [prompt.id]: event.target.value }))}><option value="">Choisir un terme</option>{question.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>)}</div> : <fieldset><legend>{question.instruction}</legend><div className="quiz-options">{question.options.map((option) => <label key={option.id}><input type={question.responseType === "multiple" ? "checkbox" : "radio"} name="answer" checked={selected.includes(option.id)} onChange={() => toggle(option.id)} /><span><strong>{option.id}.</strong> {option.label}</span></label>)}</div></fieldset>}<p role="alert" aria-live="assertive">{error}</p><button type="submit">Valider ma réponse</button></form> : <section className="quiz-feedback" aria-live="polite"><h2 ref={feedbackRef} tabIndex={-1}>Correction</h2><p><strong>Réponse proposée :</strong> {question.expected.join(" ; ")}</p>{question.responseType !== "single" ? <><p><strong>Éléments reconnus :</strong> {recognized.join(", ") || "aucun"}.</p><p><strong>Éléments à revoir :</strong> {toReview.join(", ") || "aucun"}.</p></> : null}<p>{question.feedback}</p><p><strong>À retenir :</strong> {question.remember}</p><ul>{question.usefulWords.map((word) => <li key={word.id}><a href={usefulWordHash(word.id)}>{word.label}</a></li>)}</ul><button type="button" onClick={next}>{index === 7 ? "Voir le bilan" : "Question suivante"}</button></section>}
  </main>;
}
