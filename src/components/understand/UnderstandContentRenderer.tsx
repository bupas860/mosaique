import type { ContentBlock, InlineSegment } from "../../types/understand";

function safeHref(href: string) {
  if (/^https?:\/\//i.test(href) || /^#\/[a-z0-9/-]+$/i.test(href)) return href;
  throw new Error(`URL publique non autorisée : ${href}`);
}

export function UnderstandInlineRenderer({ segments }: { segments: InlineSegment[] }) {
  return <>{segments.map((segment, index) => {
    const key = `${segment.type}-${index}`;
    if (segment.type === "text") return <span key={key}>{segment.text}</span>;
    if (segment.type === "code") return <code key={key}>{segment.text}</code>;
    if (segment.type === "emphasis") return <em key={key}><UnderstandInlineRenderer segments={segment.children} /></em>;
    if (segment.type === "strong") return <strong key={key}><UnderstandInlineRenderer segments={segment.children} /></strong>;
    if (segment.type === "link") return <a key={key} href={safeHref(segment.href)}><UnderstandInlineRenderer segments={segment.label} />{segment.external && <span className="sr-only"> (lien externe)</span>}</a>;
    return assertNever(segment);
  })}</>;
}

function Heading({ block }: { block: Extract<ContentBlock, { type: "heading" }> }) {
  const content = <UnderstandInlineRenderer segments={block.content} />;
  if (block.level <= 2) return <h3 id={block.id} tabIndex={-1}>{content}</h3>;
  if (block.level === 3) return <h4 id={block.id} tabIndex={-1}>{content}</h4>;
  return <h5 id={block.id} tabIndex={-1}>{content}</h5>;
}

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "heading") return <Heading block={block} />;
  if (block.type === "paragraph") return <p><UnderstandInlineRenderer segments={block.content} /></p>;
  if (block.type === "list") {
    const items = block.items.map((item, index) => <li key={index}><UnderstandContentRenderer blocks={item} /></li>);
    return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
  }
  if (block.type === "quote") return <blockquote><UnderstandContentRenderer blocks={block.blocks} /></blockquote>;
  if (block.type === "callout") return <aside className={`understand-callout understand-callout--${block.tone}`}><UnderstandContentRenderer blocks={block.blocks} /></aside>;
  if (block.type === "table") return <div className="understand-table-scroll" tabIndex={0} role="region" aria-label="Tableau défilable"><table><thead><tr>{block.headers.map((cell, index) => <th scope="col" key={index}><UnderstandInlineRenderer segments={cell} /></th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><UnderstandInlineRenderer segments={cell} /></td>)}</tr>)}</tbody></table></div>;
  if (block.type === "definition") return <dl><dt><UnderstandInlineRenderer segments={block.term} /></dt><dd><UnderstandContentRenderer blocks={block.blocks} /></dd></dl>;
  if (block.type === "debrief-question") return <p className="understand-question"><strong>Question de débrief : </strong><UnderstandInlineRenderer segments={block.content} /></p>;
  if (block.type === "reference") return <p className="understand-reference"><UnderstandInlineRenderer segments={block.content} /></p>;
  if (block.type === "dated-warning") return <aside className="understand-dated"><strong><UnderstandInlineRenderer segments={block.label} /></strong><p>Vérifié le {block.verifiedAt}. Portée : {block.scope}. À revérifier pour tout usage ultérieur.</p></aside>;
  return assertNever(block);
}

function assertNever(value: never): never {
  if (import.meta.env.DEV) throw new Error(`Type de contenu Comprendre inconnu : ${JSON.stringify(value)}`);
  throw new Error("Un contenu validé ne peut pas être affiché.");
}

export default function UnderstandContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return <>{blocks.map((block, index) => <Block key={`${block.type}-${index}`} block={block} />)}</>;
}
