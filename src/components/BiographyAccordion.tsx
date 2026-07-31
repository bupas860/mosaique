import type { RefObject } from "react";

interface Props {
  id: string;
  title: string;
  open: boolean;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function BiographyAccordion({ id, title, open, buttonRef, onToggle, children }: Props) {
  const buttonId = `biography-button-${id}`;
  const panelId = `biography-panel-${id}`;
  return (
    <section className="biography-accordion">
      <h2>
        <button ref={buttonRef} type="button" id={buttonId} aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          <span>{title}</span><span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </h2>
      <div id={panelId} aria-labelledby={buttonId} hidden={!open} className="biography-accordion__panel">{children}</div>
    </section>
  );
}
