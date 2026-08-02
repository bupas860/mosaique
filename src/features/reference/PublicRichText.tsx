import type { ReactNode } from "react";
import type { PublicTextBlock } from "../../data/public/publicReference.types";

function inline(value: string, linkTargets: Readonly<Record<string, string>> = {}): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  return value.split(pattern).filter(Boolean).map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return linkTargets[bold[1]] ? <a key={index} href={linkTargets[bold[1]]}>{bold[1]}</a> : <strong key={index}>{bold[1]}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    return <span key={index}>{part}</span>;
  });
}

export function PublicInline({ text, links }: { text: string; links?: Readonly<Record<string, string>> }) {
  const lines = text.split("\n");
  return <>{lines.map((line, index) => <span key={index}>{index > 0 ? <br /> : null}{inline(line, links)}</span>)}</>;
}

export default function PublicRichText({ blocks }: { blocks: readonly PublicTextBlock[] }) {
  return <>{blocks.map((block, index) => {
    if (block.type === "list") return <ul key={index}>{block.items?.map((item) => <li key={item}><PublicInline text={item} /></li>)}</ul>;
    if (block.type === "callout") return <aside key={index} className="reference-callout">{block.label ? <h3>{block.label}</h3> : null}<p><PublicInline text={block.text ?? ""} /></p></aside>;
    return <p key={index}><PublicInline text={block.text ?? ""} /></p>;
  })}</>;
}
