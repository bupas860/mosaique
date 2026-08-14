import type { PublicUsefulWordReference } from "../../data/public/publicSituations.types";

export default function UsefulWordList({ words, situationCode }: { words: readonly PublicUsefulWordReference[]; situationCode: string }) {
  return <ul className="public-useful-words">{words.map((word) => <li key={word.id}><a href={`${word.target}?from=situation-${situationCode}`}>{word.label}</a></li>)}</ul>;
}
