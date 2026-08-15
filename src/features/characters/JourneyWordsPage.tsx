import { publicJourneyWords, publicJourneyWordsSubtitle, publicJourneyWordsTitle } from "../../data/public/publicJourneyWords.generated";

type JourneyWord = (typeof publicJourneyWords)[number];
type JourneyWordId = JourneyWord["id"];

type JourneyWordGroup = {
  readonly id: string;
  readonly title: string;
  readonly wordIds: readonly JourneyWordId[];
};

const journeyWordGroups = [
  { id: "orientations", title: "Orientations et attirances", wordIds: ["MU-ORI", "MU-ASE", "MU-ARO"] },
  { id: "genre", title: "Genre et caractéristiques sexuées", wordIds: ["MU-IDG", "MU-EXG", "MU-CSX", "MU-SAN", "MU-PRO", "MU-TRA", "MU-NBI", "MU-INT"] },
  { id: "parcours", title: "Parcours et confidentialité", wordIds: ["MU-CIN", "MU-COU", "MU-OUT", "MU-CONF"] },
] as const satisfies readonly JourneyWordGroup[];

function groupedJourneyWords() {
  const wordsById = new Map<JourneyWordId, JourneyWord>();
  for (const word of publicJourneyWords) wordsById.set(word.id, word);
  if (wordsById.size !== publicJourneyWords.length) throw new Error("Un Mot et parcours est présent plusieurs fois dans les données publiques");

  const classifiedIds = new Set<JourneyWordId>();
  const groups = journeyWordGroups.map((group) => ({
    ...group,
    words: group.wordIds.map((wordId) => {
      if (classifiedIds.has(wordId)) throw new Error(`Mot et parcours classé deux fois : ${wordId}`);
      classifiedIds.add(wordId);
      const word = wordsById.get(wordId);
      if (!word) throw new Error(`Mot et parcours absent : ${wordId}`);
      return word;
    }),
  }));

  const unclassified = publicJourneyWords.filter(({ id }) => !classifiedIds.has(id));
  if (unclassified.length > 0) throw new Error(`Mots et parcours non classés : ${unclassified.map(({ id }) => id).join(", ")}`);
  return groups;
}

const groupedWords = groupedJourneyWords();

export default function JourneyWordsPage() {
  return (
    <main className="journey-words-page">
      <p><a href="#/personnages" className="app-text-link">Retour aux personnages</a></p>
      <header><h1>{publicJourneyWordsTitle}</h1><p>{publicJourneyWordsSubtitle}</p></header>
      <div className="journey-word-groups">
        {groupedWords.map((group) => <section key={group.id} className="journey-word-group" aria-labelledby={`journey-word-group-${group.id}`}>
          <h2 id={`journey-word-group-${group.id}`}>{group.title}</h2>
          <ul className="journey-words-list">
            {group.words.map((word) => <li key={word.id}><a className="journey-word-card" href={word.target}><strong>{word.label}</strong><span aria-hidden="true">→</span></a></li>)}
          </ul>
        </section>)}
      </div>
    </main>
  );
}
