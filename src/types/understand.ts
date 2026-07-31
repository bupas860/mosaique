export type UnderstandModuleId = `M${'01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'}`

export type InlineSegment =
  | { type: 'text'; text: string }
  | { type: 'emphasis'; children: InlineSegment[] }
  | { type: 'strong'; children: InlineSegment[] }
  | { type: 'code'; text: string }
  | { type: 'link'; label: InlineSegment[]; href: string; external: boolean }

export type HeadingBlock = { type: 'heading'; level: number; id: string; content: InlineSegment[] }
export type ParagraphBlock = { type: 'paragraph'; content: InlineSegment[] }
export type ListBlock = { type: 'list'; ordered: boolean; items: ContentBlock[][] }
export type QuoteBlock = { type: 'quote'; blocks: ContentBlock[] }
export type CalloutBlock = { type: 'callout'; tone: 'information' | 'warning'; blocks: ContentBlock[] }
export type TableBlock = { type: 'table'; headers: InlineSegment[][]; rows: InlineSegment[][][] }
export type DefinitionBlock = { type: 'definition'; term: InlineSegment[]; blocks: ContentBlock[] }
export type DebriefQuestionBlock = { type: 'debrief-question'; content: InlineSegment[] }
export type ReferenceBlock = { type: 'reference'; content: InlineSegment[] }
export type DatedWarningBlock = { type: 'dated-warning'; label: InlineSegment[]; verifiedAt: string; scope: string }

export type ContentBlock = HeadingBlock | ParagraphBlock | ListBlock | QuoteBlock | CalloutBlock | TableBlock | DefinitionBlock | DebriefQuestionBlock | ReferenceBlock | DatedWarningBlock
export type DatedContent = { label: string; verifiedAt: string; scope: string }

export type UnderstandManifest = { schemaVersion: string; generatedAtPolicy: 'deterministic-no-runtime-timestamp'; moduleCount: 12; glossaryEntryCount: 68; publicSourceCount: 164; situationCount: 24; groupsCount: 4; readingPathsCount: 4; moduleIds: UnderstandModuleId[]; publicSourceRange: { first: 'S001'; last: 'S164' }; sourceContentHashes: { modules: Record<UnderstandModuleId, string>; summary: string; glossary: string; links: string; bibliography: string } }
export type UnderstandModuleSummary = { id: UnderstandModuleId; number: number; title: string; summary: string; directQuestion: string; groupId: string; readingTime: { essential: string; deepDive: string }; dependencies: UnderstandModuleId[]; relatedModules: UnderstandModuleId[]; situations: string[]; notions: string[]; datedContent: DatedContent[]; status: 'validated'; pilot: boolean; dataFile: string }
export type UnderstandIndex = { schemaVersion: string; groups: Array<{ id: string; label: string; moduleIds: UnderstandModuleId[]; directQuestion: string }>; readingPaths: Array<{ id: string; title: string; order: UnderstandModuleId[]; objective: string; duration: string; audience: string; caveat: string }>; modules: UnderstandModuleSummary[] }
export type UnderstandModule = { schemaVersion: string; id: UnderstandModuleId; number: number; title: string; status: 'validated'; pilot: boolean; directQuestion: string; groupId: string; readingTime: { essential: string; deepDive: string }; datedContent: DatedContent[]; essential: { sections: ContentBlock[] }; deepDive: { sections: Array<{ id: string; title: string; blocks: ContentBlock[] }> }; takeaways: ContentBlock[]; professionalQuestion: ContentBlock[]; debriefQuestions: ContentBlock[]; centralSources: string[]; moduleBibliography: ContentBlock[]; related: { modules: UnderstandModuleId[]; notions: string[]; situations: string[]; modes: string[] }; contentHash: string }
export type GlossaryEntry = { id: string; term: string; shortDefinition: ContentBlock[]; notToConfuseWith: ContentBlock[]; moduleIds: UnderstandModuleId[]; status: 'durable' | 'dated'; usageNote: ContentBlock[] }
export type BibliographyEntry = { id: string; reference: ContentBlock[]; moduleIds: UnderstandModuleId[]; nature: string; status: string; links: Array<{ label: string; href: string }>; maintenance?: { verifiedAt?: string; recommendedFrequency?: string; officialPrioritySource?: string; obsolescenceRisk?: string } }
export type SituationLink = { code: string; title: string; family: string; frozenRole: string; moduleIds: UnderstandModuleId[]; routePolicy: 'activate-only-if-existing' }
export type UnderstandLinks = { schemaVersion: string; moduleRelations: Array<{ moduleId: UnderstandModuleId; dependencies: UnderstandModuleId[]; recommended: UnderstandModuleId[]; relatedModules: UnderstandModuleId[]; situations: string[]; modes: string[]; routePolicy: 'internal-understand-route' }>; notionRelations: Array<{ moduleId: UnderstandModuleId; notionIds: string[]; routePolicy: 'internal-understand-route' }>; situations: SituationLink[]; modes: Array<{ label: string; moduleIds: UnderstandModuleId[]; routePolicy: 'activate-only-if-existing' }> }
