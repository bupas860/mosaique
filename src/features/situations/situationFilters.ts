import type { PublicFocalId, PublicSituation, PublicSituationRole } from "../../data/public/publicSituations.types";

export type FocalFilter = "all" | PublicFocalId;
export type RoleFilter = "all" | PublicSituationRole;

export function filterPublicSituations(situations: readonly PublicSituation[], focal: FocalFilter, role: RoleFilter): readonly PublicSituation[] {
  return situations.filter((situation) => (focal === "all" || situation.focalId === focal) && (role === "all" || situation.role === role));
}

export function firstCompleteSentence(paragraph: string): string {
  return paragraph.match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0] ?? paragraph;
}
