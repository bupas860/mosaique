const FIRST_NAME_MARKER = "[Prénom]";

export function personalizePlayerText(text: string, characterName: string): string {
  return text.replaceAll(FIRST_NAME_MARKER, characterName);
}
