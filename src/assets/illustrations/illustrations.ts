import homeHeroV1 from "./ui/home-hero-v1.png";
import homeHeroV2 from "./ui/home-hero-v2.png";
import p01Portrait from "./characters/p01.png";
import p02Portrait from "./characters/p02.png";
import p03Portrait from "./characters/p03.png";
import p04Portrait from "./characters/p04.png";
import p05Portrait from "./characters/p05.png";
import p06Portrait from "./characters/p06.png";
import p07Portrait from "./characters/p07.png";
import p08Portrait from "./characters/p08.png";

export type IllustrationType = "situation" | "character" | "ui";

type IllustrationFormat = "avif" | "webp" | "png" | "jpg" | "jpeg";

export interface IllustrationSource {
  format: IllustrationFormat;
  src: string;
}

export const illustrations = {
  homeHero: {
    active: homeHeroV2,
    variants: {
      v1: homeHeroV1,
      v2: homeHeroV2,
    },
  },
} as const;

export const characterIllustrations = {
  P01: p01Portrait,
  P02: p02Portrait,
  P03: p03Portrait,
  P04: p04Portrait,
  P05: p05Portrait,
  P06: p06Portrait,
  P07: p07Portrait,
  P08: p08Portrait,
} as const;

export type CharacterIllustrationId = keyof typeof characterIllustrations;

export function getCharacterIllustration(characterId: string): string | undefined {
  return characterIllustrations[characterId as CharacterIllustrationId];
}

const illustrationModules = import.meta.glob(
  "/src/assets/illustrations/**/*.{avif,webp,png,jpg,jpeg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const folderByType: Record<IllustrationType, string> = {
  situation: "situations",
  character: "characters",
  ui: "ui",
};

const formatPriority: Record<IllustrationFormat, number> = {
  avif: 0,
  webp: 1,
  png: 2,
  jpg: 3,
  jpeg: 4,
};

export function getIllustrationSources(
  type: IllustrationType,
  id: string,
): IllustrationSource[] {
  const expectedPath = `/src/assets/illustrations/${folderByType[type]}/${id}.`;

  return Object.entries(illustrationModules)
    .filter(([path]) => path.toLowerCase().startsWith(expectedPath.toLowerCase()))
    .map(([path, src]) => ({
      format: path.split(".").at(-1) as IllustrationFormat,
      src,
    }))
    .sort((left, right) => formatPriority[left.format] - formatPriority[right.format]);
}
