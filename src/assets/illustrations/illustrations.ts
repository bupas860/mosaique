import homeHeroV1 from "./ui/home-hero-v1.png";
import homeHeroV2 from "./ui/home-hero-v2.png";

export const illustrations = {
  homeHero: {
    active: homeHeroV2,
    variants: { v1: homeHeroV1, v2: homeHeroV2 },
  },
} as const;
