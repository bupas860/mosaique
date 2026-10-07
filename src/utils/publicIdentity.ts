import { currentParcours } from "../data/parcours";

export const PUBLIC_ACTIVITY = "La marche des privilèges";
export const PUBLIC_BRAND = PUBLIC_ACTIVITY;
export const PUBLIC_PARCOURS = currentParcours.publicLabel;

export function publicDocumentTitle(...parts: readonly string[]): string {
  const labels = [PUBLIC_ACTIVITY, ...parts.filter((part) => part !== PUBLIC_ACTIVITY)];
  return labels.join(" — ");
}
