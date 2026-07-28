import { useEffect, useRef } from "react";
import type { ActivePlayableCharacterV2 } from "../types/runtimeV2";
import Button from "./Button";
import CharacterInformation from "./CharacterInformation";
import CharacterPortrait from "./CharacterPortrait";

interface Props {
  character: ActivePlayableCharacterV2;
  markers: readonly string[];
  onChoose: () => void;
  onClose: () => void;
}

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function CharacterDetailDialog({
  character,
  markers,
  onChoose,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const profile = "profile" in character ? character.profile : character.presentation;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="character-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`character-dialog-title-${character.id}`}
        aria-describedby={`character-dialog-profile-${character.id}`}
        className="character-dialog"
        style={{ "--character-accent": character.accentColor } as React.CSSProperties}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="character-dialog__close"
          aria-label={`Fermer la fiche de ${character.name}`}
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="character-dialog__portrait">
          <CharacterPortrait
            characterId={character.id}
            characterName={character.name}
            image={character.image}
            accentColor={character.accentColor}
            size="card"
            eager
            className="h-full w-full"
          />
        </div>

        <div className="character-dialog__content">
          <h2
            id={`character-dialog-title-${character.id}`}
            className="character-dialog__name"
          >
            {character.name}
          </h2>
          <CharacterInformation character={character} className="mt-2" />
          <ul className="character-markers mt-4" aria-label="Repères du personnage">
            {markers.map((marker) => <li key={marker}>{marker}</li>)}
          </ul>
          <p
            id={`character-dialog-profile-${character.id}`}
            className="mt-5 whitespace-pre-line leading-relaxed text-slate-700"
          >
            {profile}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={onChoose}>Incarner ce personnage</Button>
            <Button variant="secondary" onClick={onClose}>Retour à la galerie</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
