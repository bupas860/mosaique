import { currentParcours } from "../data/parcours";

export const PUBLIC_BRAND = "Mosaïque";
export const PUBLIC_ACTIVITY = "La marche des privilèges";
export const PUBLIC_PARCOURS = currentParcours.publicLabel;

export function publicDocumentTitle(...parts: readonly string[]): string {
  return [PUBLIC_BRAND, ...parts].join(" — ");
}
