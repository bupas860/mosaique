export interface PublicTextBlock {
  readonly type: "paragraph" | "callout" | "list";
  readonly label?: string;
  readonly text?: string;
  readonly items?: readonly string[];
}

export interface PublicRepereSection {
  readonly title: string;
  readonly blocks: readonly PublicTextBlock[];
}

export interface PublicRepere {
  readonly id: `R${number}`;
  readonly routeSegment: string;
  readonly title: string;
  readonly introduction: string;
  readonly inBrief: string;
  readonly sections: readonly PublicRepereSection[];
  readonly continueText: string;
  readonly continueLinks: readonly { readonly label: string; readonly target: string }[];
  readonly usefulWords: readonly { readonly id: string; readonly label: string; readonly target: string }[];
}

export interface PublicUsefulWord {
  readonly id: `MU-${string}`;
  readonly routeSegment: string;
  readonly label: string;
  readonly term: string;
  readonly isJourneyWord: boolean;
  readonly inBrief: string;
  readonly example: string;
  readonly notConfuse: string;
  readonly remember: string;
  readonly usageSpaces: readonly string[];
  readonly datedNote: string;
  readonly publicSources: readonly string[];
  readonly relatedRepereIds: readonly string[];
}
