import type { BibliographyEntry, GlossaryEntry, UnderstandIndex, UnderstandLinks, UnderstandManifest, UnderstandModule, UnderstandModuleId } from '../../types/understand'

export type { BibliographyEntry, ContentBlock, GlossaryEntry, InlineSegment, UnderstandIndex, UnderstandLinks, UnderstandManifest, UnderstandModule, UnderstandModuleId } from '../../types/understand'

const moduleLoaders: Record<UnderstandModuleId, () => Promise<UnderstandModule>> = {
  M01: () => import('../generated-v2/understand/modules/m01.json').then(({ default: data }) => data as UnderstandModule),
  M02: () => import('../generated-v2/understand/modules/m02.json').then(({ default: data }) => data as UnderstandModule),
  M03: () => import('../generated-v2/understand/modules/m03.json').then(({ default: data }) => data as UnderstandModule),
  M04: () => import('../generated-v2/understand/modules/m04.json').then(({ default: data }) => data as UnderstandModule),
  M05: () => import('../generated-v2/understand/modules/m05.json').then(({ default: data }) => data as UnderstandModule),
  M06: () => import('../generated-v2/understand/modules/m06.json').then(({ default: data }) => data as UnderstandModule),
  M07: () => import('../generated-v2/understand/modules/m07.json').then(({ default: data }) => data as UnderstandModule),
  M08: () => import('../generated-v2/understand/modules/m08.json').then(({ default: data }) => data as UnderstandModule),
  M09: () => import('../generated-v2/understand/modules/m09.json').then(({ default: data }) => data as UnderstandModule),
  M10: () => import('../generated-v2/understand/modules/m10.json').then(({ default: data }) => data as UnderstandModule),
  M11: () => import('../generated-v2/understand/modules/m11.json').then(({ default: data }) => data as UnderstandModule),
  M12: () => import('../generated-v2/understand/modules/m12.json').then(({ default: data }) => data as UnderstandModule),
}

export const loadUnderstandManifest = () => import('../generated-v2/understand/manifest.json').then(({ default: data }) => data as UnderstandManifest)
export const loadUnderstandIndex = () => import('../generated-v2/understand/index.json').then(({ default: data }) => data as UnderstandIndex)
export const loadUnderstandGlossary = () => import('../generated-v2/understand/glossary.json').then(({ default: data }) => data.entries as GlossaryEntry[])
export const loadUnderstandBibliography = () => import('../generated-v2/understand/bibliography.json').then(({ default: data }) => data.entries as BibliographyEntry[])
export const loadUnderstandLinks = () => import('../generated-v2/understand/links.json').then(({ default: data }) => data as UnderstandLinks)
export const loadUnderstandModule = (id: UnderstandModuleId) => moduleLoaders[id]()
