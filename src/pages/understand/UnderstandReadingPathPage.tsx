import UnderstandBreadcrumbs from "../../components/understand/UnderstandBreadcrumbs";
import { UnderstandErrorState, UnderstandLoadingState } from "../../components/understand/UnderstandStates";
import { useTargetFocus, useUnderstandData } from "../../components/understand/useUnderstandData";
import { loadUnderstandIndex } from "../../data/v2/understandV2";
import { understandModuleHash } from "../../utils/appRoute";

export default function UnderstandReadingPathPage({ pathId }: { pathId: string }) {
  const { data, error } = useUnderstandData(loadUnderstandIndex); const path = data?.readingPaths.find(({ id }) => id === pathId); useTargetFocus(undefined, Boolean(path));
  if (error) return <UnderstandErrorState message="Ce parcours ne peut pas être chargé." modules />;
  if (!data) return <UnderstandLoadingState />;
  if (!path) return <UnderstandErrorState message="Cet identifiant de parcours n’existe pas." modules />;
  return <main className="understand-page"><div className="understand-page__inner"><UnderstandBreadcrumbs current={path.title} /><header className="understand-header"><p className="understand-kicker">Parcours de lecture</p><h1 id="understand-page-title" tabIndex={-1}>{path.title}</h1><p>{path.objective}</p></header><dl className="understand-meta"><div><dt>Durée indicative</dt><dd>{path.duration}</dd></div>{path.audience && <div><dt>Public</dt><dd>{path.audience}</dd></div>}<div><dt>Ce parcours ne remplace pas</dt><dd>{path.caveat}</dd></div></dl><section aria-labelledby="path-modules"><h2 id="path-modules">Ordre recommandé</h2><ol className="understand-reading-order">{path.order.map((id) => { const module = data.modules.find((candidate) => candidate.id === id); return module && <li key={id}><a href={understandModuleHash(id)}><strong>{id} — {module.title}</strong></a><span>{module.readingTime.essential} pour L’essentiel</span></li>; })}</ol></section><nav className="understand-footer-nav" aria-label="Navigation du parcours"><a href="#/comprendre">Retour à Comprendre</a><a href="#/comprendre/modules">Sommaire complet</a>{path.order[0] && <a href={understandModuleHash(path.order[0])}>Commencer par {path.order[0]}</a>}</nav></div></main>;
}
