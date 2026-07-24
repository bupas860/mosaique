import { useEffect, useState } from "react";

import { getCharacterIllustration } from "../assets/illustrations/illustrations";

export type CharacterPortraitSize = "card" | "compact" | "avatar" | "progress" | "summary";

interface Props {
  characterId: string;
  characterName: string;
  size?: CharacterPortraitSize;
  className?: string;
  eager?: boolean;
  decorative?: boolean;
}

const dimensions: Record<CharacterPortraitSize, { width: number; height: number }> = {
  card: { width: 600, height: 800 },
  compact: { width: 64, height: 80 },
  avatar: { width: 40, height: 40 },
  progress: { width: 36, height: 36 },
  summary: { width: 96, height: 120 },
};

export default function CharacterPortrait({
  characterId,
  characterName,
  size = "avatar",
  className = "",
  eager = false,
  decorative = false,
}: Props) {
  const source = getCharacterIllustration(characterId);
  const [hasError, setHasError] = useState(false);
  const { width, height } = dimensions[size];
  const alt = /^[aeiouyàâäéèêëîïôöùûü]/i.test(characterName)
    ? `Portrait d’${characterName}`
    : `Portrait de ${characterName}`;

  useEffect(() => {
    setHasError(false);
  }, [characterId]);

  return (
    <div
      className={`character-portrait character-portrait--${size} character-portrait--${characterId.toLowerCase()} ${className}`}
    >
      {source && !hasError ? (
        <img
          src={source}
          alt={decorative ? "" : alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          onError={() => setHasError(true)}
          className="character-portrait__image character-portrait__image--loaded"
        />
      ) : (
        <div
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : alt}
          aria-hidden={decorative ? "true" : undefined}
          className="character-portrait__placeholder"
        >
          <span aria-hidden="true">{characterName.charAt(0).toUpperCase()}</span>
          <span className="sr-only">Illustration indisponible</span>
        </div>
      )}
    </div>
  );
}
