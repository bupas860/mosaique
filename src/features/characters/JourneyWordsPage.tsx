import { publicJourneyWords, publicJourneyWordsSubtitle, publicJourneyWordsTitle } from "../../data/public/publicJourneyWords.generated";

export default function JourneyWordsPage() {
  return (
    <main className="journey-words-page">
      <p><a href="#/personnages" className="app-text-link">Retour aux personnages</a></p>
      <header><h1>{publicJourneyWordsTitle}</h1><p>{publicJourneyWordsSubtitle}</p></header>
      <ul className="journey-words-list">
        {publicJourneyWords.map((word) => <li key={word.id}><span className="journey-word-id">{word.id}</span><strong>{word.label}</strong></li>)}
      </ul>
    </main>
  );
}
