import type { EditorialCharacterIdV2 } from "./editorialV2";

export interface PublicBiographyInline {
  readonly text: string;
  readonly emphasis?: true;
}

export interface PublicBiographyParagraph {
  readonly type: "paragraph";
  readonly content: readonly PublicBiographyInline[];
}

export interface PublicBiographyList {
  readonly type: "list";
  readonly items: readonly (readonly PublicBiographyInline[])[];
}

export interface PublicBiographyTimeline {
  readonly type: "timeline";
  readonly entries: readonly {
    readonly period: string;
    readonly content: readonly PublicBiographyInline[];
  }[];
}

export interface DisclosureEntry {
  readonly group: string;
  readonly currentSituation: string;
}

export interface PublicBiographyDisclosureMap {
  readonly type: "disclosure-map";
  readonly entries: readonly DisclosureEntry[];
}

export type PublicBiographyBlock =
  | PublicBiographyParagraph
  | PublicBiographyList
  | PublicBiographyTimeline
  | PublicBiographyDisclosureMap;

export interface PublicBiographySection {
  readonly number: number;
  readonly title: string;
  readonly blocks: readonly PublicBiographyBlock[];
}

export interface PublicBiography {
  readonly id: EditorialCharacterIdV2;
  readonly name: string;
  readonly age: number;
  readonly schoolLevel: string;
  readonly gallery: "general" | "intersectional";
  readonly galleryLabel: string;
  readonly shortDescription: string;
  readonly portraitId: EditorialCharacterIdV2;
  readonly portraitAlt: string;
  readonly sections: readonly PublicBiographySection[];
}
