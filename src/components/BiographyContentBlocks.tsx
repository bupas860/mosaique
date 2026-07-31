import type { PublicBiographyBlock, PublicBiographyInline } from "../types/publicBiography";
import BiographyDisclosureMap from "./BiographyDisclosureMap";

const inline = (content: readonly PublicBiographyInline[]) => content.map((segment, index) =>
  segment.emphasis ? <strong key={index}>{segment.text}</strong> : <span key={index}>{segment.text}</span>,
);

interface Props {
  blocks: readonly PublicBiographyBlock[];
}

export default function BiographyContentBlocks({ blocks }: Props) {
  return <div className="biography-blocks">{blocks.map((block, index) => {
    if (block.type === "paragraph") return <p key={index}>{inline(block.content)}</p>;
    if (block.type === "list") return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</ul>;
    if (block.type === "timeline") return (
      <ol key={index} className="biography-timeline">
        {block.entries.map((entry, entryIndex) => <li key={`${entry.period}-${entryIndex}`}><strong>{entry.period}&nbsp;:</strong> {inline(entry.content)}</li>)}
      </ol>
    );
    return <BiographyDisclosureMap key={index} entries={block.entries} />;
  })}</div>;
}
