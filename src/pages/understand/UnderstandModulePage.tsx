import { useCallback, useMemo } from "react";
import UnderstandBreadcrumbs from "../../components/understand/UnderstandBreadcrumbs";
import UnderstandContentRenderer from "../../components/understand/UnderstandContentRenderer";
import UnderstandDeepDive from "../../components/understand/UnderstandDeepDive";
import { UnderstandErrorState, UnderstandLoadingState } from "../../components/understand/UnderstandStates";
import { useTargetFocus, useUnderstandData } from "../../components/understand/useUnderstandData";
import { loadUnderstandIndex, loadUnderstandLinks, loadUnderstandModule } from "../../data/v2/understandV2";
import type { UnderstandModuleId } from "../../types/understand";
import { understandBibliographyHash, understandGlossaryHash, understandModuleHash } from "../../utils/appRoute";

const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function UnderstandModulePage({ moduleId, sectionId }: { moduleId: UnderstandModuleId; sectionId?: string }) {
  const loader = useCallback(async () => {
    const [index, links, module] = await Promise.all([loadUnderstandIndex(), loadUnderstandLinks(), loadUnderstandModule(moduleId)]);
    return { index, links, module };
  }, [moduleId]);
  const { data, error } = useUnderstandData(loader);
  const target = useMemo(() => data?.module.deepDive.sections.some(({ id }) => id === sectionId) ? `deep-${sectionId}` : sectionId, [data, sectionId]);
  const validSection = !sectionId || Boolean(data?.module.deepDive.sections.some(({ id }) => id === sectionId) || data?.module.essential.sections.some((block) => block.type === "heading" && block.id === sectionId));
  useTargetFocus(target, Boolean(data && validSection));
  if (error) return <UnderstandErrorState message={`Le module ${moduleId} ne peut pas être chargé.`} modules />;
  if (!data) return <UnderstandLoadingState />;
  if (!validSection) return <UnderstandErrorState message={`La section « ${sectionId} » n’existe pas dans ${moduleId}.`} modules />;
  const { index, module } = data;
  const summary = index.modules.find(({ id }) => id === moduleId);
  const group = index.groups.find(({ id }) => id === module.groupId);
  const position = index.modules.findIndex(({ id }) => id === moduleId);
  if (!summary || !group) return <UnderstandErrorState message="Les métadonnées de ce module sont incohérentes." modules />;
  const previous = index.modules[position - 1]; const next = index.modules[position + 1];
  const essentialHeadings = module.essential.sections.filter((block) => block.type === "heading");
  const focusLocal = (id: string) => { const element = document.getElementById(id); element?.focus({ preventScroll: true }); element?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); };
  return (
    <main className="understand-page understand-module"><div className="understand-page__inner">
      <UnderstandBreadcrumbs current={`${module.id} — ${module.title}`} modules />
      <header className="understand-header"><p className="understand-kicker">{module.id} · Module {module.number}</p><h1 id="understand-page-title" tabIndex={-1}>{module.title}</h1><p className="understand-question">{module.directQuestion}</p><p>{group.label}</p><dl className="understand-meta"><div><dt>L’essentiel</dt><dd>{module.readingTime.essential}</dd></div><div><dt>Approfondir</dt><dd>{module.readingTime.deepDive}</dd></div><div><dt>Statut</dt><dd>Validé{module.pilot && " · Pilote"}</dd></div></dl>{summary.dependencies.length > 0 && <p><strong>Appuis recommandés, non bloquants :</strong> {summary.dependencies.map((id, indexPosition) => <span key={id}>{indexPosition > 0 && ", "}<a href={understandModuleHash(id)}>{id}</a></span>)}</p>}</header>
      {module.datedContent.map((dated, indexPosition) => <aside className="understand-dated" key={indexPosition}><h2>{dated.label}</h2><p>Vérifié le {dated.verifiedAt}. Portée : {dated.scope}. Ces informations doivent être revérifiées pour tout usage ultérieur.</p></aside>)}
      <nav className="understand-toc" aria-label="Sommaire interne du module"><h2>Dans ce module</h2><ul>
        <li><button type="button" className="understand-link-button" onClick={() => focusLocal("essential-title")}>L’essentiel</button></li>
        {essentialHeadings.map((heading) => <li key={heading.id}><a href={understandModuleHash(moduleId, heading.id)}>{heading.content.map((segment) => segment.type === "text" || segment.type === "code" ? segment.text : "").join("")}</a></li>)}
        <li>{module.deepDive.sections[0] ? <a href={understandModuleHash(moduleId, module.deepDive.sections[0].id)}>Approfondir</a> : "Approfondir"}<ul>{module.deepDive.sections.map((section) => <li key={section.id}><a href={understandModuleHash(moduleId, section.id)}>{section.title}</a></li>)}</ul></li>
        {module.takeaways.length > 0 && <li><button type="button" className="understand-link-button" onClick={() => focusLocal("module-end-title")}>Idées à retenir</button></li>}
        {module.debriefQuestions.length > 0 && <li><button type="button" className="understand-link-button" onClick={() => focusLocal("module-end-title")}>Questions professionnelles et de débrief</button></li>}
        <li><button type="button" className="understand-link-button" onClick={() => focusLocal("module-sources")}>Sources et renvois</button></li>
      </ul></nav>
      <section id="understand-essential" aria-labelledby="essential-title"><h2 id="essential-title" tabIndex={-1}>L’essentiel</h2><UnderstandContentRenderer blocks={module.essential.sections} /></section>
      <UnderstandDeepDive module={module} initiallyOpen={Boolean(sectionId && module.deepDive.sections.some(({ id }) => id === sectionId))} />
      <section id="module-takeaways" className="understand-module-end" aria-labelledby="module-end-title"><h2 id="module-end-title" tabIndex={-1}>Repères et renvois</h2><div id="module-sources" tabIndex={-1}><h3>Modules liés</h3><ul>{module.related.modules.map((id) => <li key={id}><a href={understandModuleHash(id)}>Lire {id}</a></li>)}</ul><h3>Notions liées</h3><ul>{summary.notions.filter((term) => module.related.notions.includes(slug(term))).map((term) => <li key={term}><a href={understandGlossaryHash(slug(term))}>{term}</a></li>)}</ul><h3>Situations associées</h3><ul>{module.related.situations.map((code) => { const situation = data.links.situations.find((candidate) => candidate.code === code); return <li key={code}>{situation ? `${code} — ${situation.title}` : code} <span className="understand-unavailable">Route non disponible</span></li>; })}</ul><h3>Modes concernés</h3><ul>{module.related.modes.map((mode) => <li key={mode}>{mode} <span className="understand-unavailable">Route non disponible</span></li>)}</ul><h3>Sources centrales</h3><ul>{module.centralSources.map((id) => <li key={id}><a href={understandBibliographyHash(id)}>Consulter {id} dans la bibliographie publique</a></li>)}</ul></div></section>
      <nav className="understand-footer-nav" aria-label="Modules précédent et suivant"><a href="#/comprendre">Retour à Comprendre</a><a href="#/comprendre/modules">Sommaire des modules</a>{previous && <a href={understandModuleHash(previous.id)}>Module précédent : {previous.id}</a>}{next && <a href={understandModuleHash(next.id)}>Module suivant : {next.id}</a>}</nav>
    </div></main>
  );
}
