import { useEffect, useState } from "react";
import type { UnderstandModule } from "../../types/understand";
import UnderstandContentRenderer from "./UnderstandContentRenderer";

export default function UnderstandDeepDive({ module, initiallyOpen }: { module: UnderstandModule; initiallyOpen: boolean }) {
  const storageKey = `mosaique:understand:${module.id}:deep-dive`;
  const [open, setOpen] = useState(() => initiallyOpen || sessionStorage.getItem(storageKey) === "open");
  useEffect(() => { if (initiallyOpen) setOpen(true); }, [initiallyOpen]);
  function toggle() { setOpen((current) => { const next = !current; sessionStorage.setItem(storageKey, next ? "open" : "closed"); return next; }); }
  return <section className="understand-deep-dive" aria-labelledby="deep-dive-title"><h2 id="deep-dive-title"><button type="button" aria-expanded={open} aria-controls="deep-dive-panel" onClick={toggle}>Approfondir <span aria-hidden="true">{open ? "−" : "+"}</span></button></h2><div id="deep-dive-panel" aria-labelledby="deep-dive-title" hidden={!open}>{module.deepDive.sections.map((section) => <section key={section.id} aria-labelledby={`deep-${section.id}`}><h3 id={`deep-${section.id}`} tabIndex={-1}>{section.title}</h3><UnderstandContentRenderer blocks={section.blocks} /></section>)}</div></section>;
}
