import { useEffect } from "react";
import UnderstandBreadcrumbs from "../../components/understand/UnderstandBreadcrumbs";
import UnderstandContentRenderer from "../../components/understand/UnderstandContentRenderer";
import { UnderstandErrorState, UnderstandLoadingState } from "../../components/understand/UnderstandStates";
import { useTargetFocus, useUnderstandData } from "../../components/understand/useUnderstandData";
import { loadUnderstandGlossary } from "../../data/v2/understandV2";
import { understandGlossaryHash, understandModuleHash } from "../../utils/appRoute";

const SCROLL_KEY = "mosaique:understand:glossary-scroll";

export default function UnderstandGlossaryPage({ notionId }: { notionId?: string }) {
  const { data, error } = useUnderstandData(loadUnderstandGlossary);
  const selected = notionId ? data?.find(({ id }) => id === notionId) : undefined;
  const valid = !notionId || Boolean(selected);
  useTargetFocus(notionId ? `glossary-${notionId}` : undefined, Boolean(data && valid));
  useEffect(() => { if (!notionId && data) { const saved = Number(sessionStorage.getItem(SCROLL_KEY)); if (Number.isFinite(saved) && saved > 0) requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: "auto" })); } }, [data, notionId]);
  if (error) return <UnderstandErrorState message="Le glossaire ne peut pas être chargé." />;
  if (!data) return <UnderstandLoadingState />;
  if (!valid) return <UnderstandErrorState message={`La notion « ${notionId} » n’existe pas dans le glossaire validé.`} />;
  const initials = [...new Set(data.map(({ term }) => term[0].toLocaleUpperCase("fr")))];
  const goToInitial = (initial: string) => { const target = document.getElementById(`glossary-initial-${encodeURIComponent(initial)}`); target?.focus({ preventScroll: true }); target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  return <main className="understand-page"><div className="understand-page__inner"><UnderstandBreadcrumbs current="Glossaire" /><header className="understand-header"><h1 id="understand-page-title" tabIndex={-1}>Glossaire</h1><p>68 notions canoniques, classées par ordre alphabétique.</p></header><nav className="understand-initials" aria-label="Initiales du glossaire">{initials.map((initial) => <button type="button" key={initial} onClick={() => goToInitial(initial)}>{initial}</button>)}</nav><div className="understand-glossary">{data.map((entry, index) => { const initial = entry.term[0].toLocaleUpperCase("fr"); const startsGroup = index === 0 || data[index - 1].term[0].toLocaleUpperCase("fr") !== initial; return <section key={entry.id} className="understand-glossary-entry" aria-labelledby={`glossary-${entry.id}`}>{startsGroup && <h2 className="understand-initial-heading" id={`glossary-initial-${encodeURIComponent(initial)}`} tabIndex={-1}>{initial}</h2>}<h3 id={`glossary-${entry.id}`} tabIndex={-1}><a href={understandGlossaryHash(entry.id)} onClick={() => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))}>{entry.term}</a></h3><p className="understand-status">{entry.status === "dated" ? "Contenu daté" : "Contenu durable"}</p><UnderstandContentRenderer blocks={entry.shortDefinition} /><h4>À ne pas confondre avec</h4><UnderstandContentRenderer blocks={entry.notToConfuseWith} /><h4>Remarque d’usage</h4><UnderstandContentRenderer blocks={entry.usageNote} /><p><strong>Modules de référence :</strong> {entry.moduleIds.map((id, moduleIndex) => <span key={id}>{moduleIndex > 0 && ", "}<a href={understandModuleHash(id)}>{id}</a></span>)}</p></section>; })}</div><p><a href="#/comprendre">Retour à Comprendre</a></p></div></main>;
}
