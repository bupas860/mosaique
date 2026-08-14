import type { PublicContinueTarget } from "../../data/public/publicSituations.types";

function activeHref(target: PublicContinueTarget): string | undefined {
  if (target.status !== "active") return undefined;
  if (target.type === "situation") return `#/situations/${target.target}`;
  if (target.type === "focal") return `#/situations/focales/${target.target}`;
  if (target.type === "route") return target.target;
  return undefined;
}

export default function ContinueLink({ destination }: { destination: PublicContinueTarget }) {
  const href = activeHref(destination);
  const publicLabel = destination.type === "situation" ? destination.label.replace(/^[VNIX]\d{2}\s*[—–-]\s*/, "") : destination.label;
  return <p className="public-situation-continue">{destination.prefix}{href ? <a href={href}>{publicLabel}</a> : <span>{publicLabel}</span>}{destination.suffix}</p>;
}
