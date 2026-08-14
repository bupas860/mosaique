export const PUBLIC_BRAND = "Parcours LGBTI+";
export const PUBLIC_ACTIVITY = "La marche des privilèges";

export function publicDocumentTitle(...parts: readonly string[]): string {
  return [PUBLIC_BRAND, ...parts].join(" — ");
}
