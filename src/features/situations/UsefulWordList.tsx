import type { PublicUsefulWordReference } from "../../data/public/publicSituations.types";

export default function UsefulWordList({ words }: { words: readonly PublicUsefulWordReference[] }) {
  return <ul className="public-useful-words">{words.map((word) => <li key={word.id}><span className="public-useful-words__id">{word.id}</span> — {word.label}</li>)}</ul>;
}
