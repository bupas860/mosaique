import { useEffect, useRef } from "react";
import Button from "./Button";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

const focusableSelector = "button:not([disabled]),[href],[tabindex]:not([tabindex='-1'])";

export default function QuitGameDialog({ onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return <div className="game-dialog-backdrop" role="presentation">
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="quit-game-title" aria-describedby="quit-game-description" className="game-dialog" onKeyDown={handleKeyDown}>
      <h2 id="quit-game-title">Quitter cette partie ?</h2>
      <p id="quit-game-description">Votre progression dans cette partie sera perdue.</p>
      <div className="game-dialog__actions">
        <button ref={cancelRef} type="button" className="game-dialog__cancel" onClick={onCancel}>Continuer la partie</button>
        <Button onClick={onConfirm}>Quitter la partie</Button>
      </div>
    </div>
  </div>;
}
