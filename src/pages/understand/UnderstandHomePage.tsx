import UnderstandBreadcrumbs from "../../components/understand/UnderstandBreadcrumbs";
import UnderstandModuleCard from "../../components/understand/UnderstandModuleCard";
import { UnderstandErrorState, UnderstandLoadingState } from "../../components/understand/UnderstandStates";
import { useTargetFocus, useUnderstandData } from "../../components/understand/useUnderstandData";
import { loadUnderstandIndex } from "../../data/v2/understandV2";
import { understandReadingPathHash } from "../../utils/appRoute";

export default function UnderstandHomePage() {
  const { data, error } = useUnderstandData(loadUnderstandIndex);
  useTargetFocus(undefined, Boolean(data));
  if (error) return <UnderstandErrorState message="Les données publiques de Comprendre n’ont pas pu être chargées." />;
  if (!data) return <UnderstandLoadingState />;
  return <main className="understand-page"><div className="understand-page__inner"><UnderstandBreadcrumbs current="Comprendre" /><header className="understand-hero"><p className="understand-kicker">Repères publics</p><h1 id="understand-page-title" tabIndex={-1}>Comprendre</h1><p>{data.groups[0].directQuestion}</p></header><section aria-labelledby="understand-groups"><h2 id="understand-groups">Quatre ensembles de navigation</h2>{data.groups.map((group) => <section className="understand-group" key={group.id} aria-labelledby={`group-${group.id}`}><h3 id={`group-${group.id}`}>{group.label}</h3><p>{group.directQuestion}</p><div className="understand-card-grid">{data.modules.filter(({ groupId }) => groupId === group.id).map((module) => <UnderstandModuleCard key={module.id} module={module} group={group.label} />)}</div></section>)}</section><p className="understand-primary-link"><a href="#/comprendre/modules">Consulter le sommaire complet des douze modules</a></p><section aria-labelledby="understand-paths"><h2 id="understand-paths">Parcours de lecture</h2><div className="understand-path-grid">{data.readingPaths.map((path) => <article key={path.id}><h3>{path.title}</h3><p>{path.objective}</p><p><strong>Durée indicative :</strong> {path.duration}</p><a href={understandReadingPathHash(path.id)}>Suivre ce parcours</a></article>)}</div></section><nav className="understand-resource-links" aria-label="Ressources transversales"><a href="#/comprendre/glossaire">Consulter le glossaire</a><a href="#/comprendre/bibliographie">Consulter la bibliographie publique</a></nav><aside className="understand-dated"><h2>Contenus datés</h2><p>Certains contenus juridiques, sanitaires ou institutionnels comportent une date et une portée. Ils doivent être revérifiés lorsqu’ils sont utilisés ultérieurement.</p></aside><p><a href="#/">Retour à l’accueil général</a></p></div></main>;
}
