import type { UnderstandModuleSummary } from "../../types/understand";
import { understandModuleHash } from "../../utils/appRoute";

export default function UnderstandModuleCard({ module, group }: { module: UnderstandModuleSummary; group: string }) {
  return <article className="understand-module-card"><p className="understand-kicker">{module.id} · {group}</p><h3>{module.title}</h3><p className="understand-question">{module.directQuestion}</p><p>{module.summary}</p><dl className="understand-meta"><div><dt>L’essentiel</dt><dd>{module.readingTime.essential}</dd></div><div><dt>Approfondir</dt><dd>{module.readingTime.deepDive}</dd></div></dl><p><span className="understand-status">Validé</span>{module.pilot && <span className="understand-status">Pilote</span>}</p><a className="understand-card-link" href={understandModuleHash(module.id)}>Lire le module {module.id}<span className="sr-only"> — {module.title}</span></a></article>;
}
