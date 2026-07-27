import type { CharacterIdV2 } from "../../types/editorialV2";
import type { CharacterPresentationConfigV2 } from "../../types/runtimeV2";

export const characterPresentationConfigV2 = {
  P01: { accentColor: "#0F766E", image: null },
  P02: { accentColor: "#377A52", image: null },
  P03: { accentColor: "#6D4CC3", image: null },
  P04: { accentColor: "#2563A9", image: null },
  P05: { accentColor: "#A83E74", image: null },
  P06: { accentColor: "#A65D20", image: null },
  P07: { accentColor: "#B85C7A", image: null },
  P08: { accentColor: "#4F46A5", image: null },
  P09: { accentColor: "#475569", image: null },
} as const satisfies Readonly<Record<CharacterIdV2, CharacterPresentationConfigV2>>;
