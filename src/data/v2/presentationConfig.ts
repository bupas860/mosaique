import type { CharacterIdV2 } from "../../types/editorialV2";
import type { CharacterPresentationConfigV2 } from "../../types/runtimeV2";
import { getCharacterPortraitV2 } from "./characterPortraitsV2";

export const characterPresentationConfigV2 = {
  P01: { accentColor: "#0F766E", image: getCharacterPortraitV2("P01") },
  P02: { accentColor: "#377A52", image: getCharacterPortraitV2("P02") },
  P03: { accentColor: "#6D4CC3", image: getCharacterPortraitV2("P03") },
  P04: { accentColor: "#2563A9", image: getCharacterPortraitV2("P04") },
  P05: { accentColor: "#A83E74", image: getCharacterPortraitV2("P05") },
  P06: { accentColor: "#A65D20", image: getCharacterPortraitV2("P06") },
  P07: { accentColor: "#B85C7A", image: getCharacterPortraitV2("P07") },
  P08: { accentColor: "#4F46A5", image: getCharacterPortraitV2("P08") },
  P09: { accentColor: "#475569", image: getCharacterPortraitV2("P09") },
} as const satisfies Readonly<Record<CharacterIdV2, CharacterPresentationConfigV2>>;
