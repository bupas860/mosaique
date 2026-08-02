export type PublicSituationCode = `${"V" | "N" | "I" | "X"}${number}`;
export type PublicFocalId = "V" | "N" | "I" | "X";
export type PublicSituationRole = "obstacle" | "protection";

export interface PublicUsefulWordReference {
  readonly id: string;
  readonly label: string;
  readonly target: string;
}

export interface PublicContinueTarget {
  readonly prefix: string;
  readonly label: string;
  readonly suffix: string;
  readonly type: "situation" | "focal" | "route" | "useful-word" | "character";
  readonly target: string;
  readonly status: "active" | "deferred";
}

export interface PublicSituation {
  readonly code: PublicSituationCode;
  readonly title: string;
  readonly focalId: PublicFocalId;
  readonly focalLabel: string;
  readonly focalSlug: string;
  readonly role: PublicSituationRole;
  readonly illustrationFile: string;
  readonly altText: string;
  readonly canonicalText: string;
  readonly observe: readonly string[];
  readonly focalAnalysis: readonly string[];
  readonly whyItMatters: readonly string[];
  readonly protectionHeading: "Ce qui pourrait protéger" | "Ce que cette protection change";
  readonly protectiveContent: readonly string[];
  readonly otherReading: readonly string[];
  readonly usefulWords: readonly PublicUsefulWordReference[];
  readonly continueTarget: PublicContinueTarget;
}

export interface PublicFocal {
  readonly id: PublicFocalId;
  readonly label: string;
  readonly slug: string;
  readonly lead: string;
  readonly inBrief: string;
  readonly recognize: readonly string[];
  readonly exampleTitle: string;
  readonly example: readonly string[];
  readonly notConfuse: string;
  readonly remember: string;
}

export interface PublicSituationsIntroduction {
  readonly paragraphs: readonly string[];
  readonly warningTitle: string;
  readonly warning: string;
}
