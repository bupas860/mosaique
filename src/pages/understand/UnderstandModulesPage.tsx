import UnderstandBreadcrumbs from "../../components/understand/UnderstandBreadcrumbs";
import UnderstandModuleCard from "../../components/understand/UnderstandModuleCard";
import { UnderstandErrorState, UnderstandLoadingState } from "../../components/understand/UnderstandStates";
import { useTargetFocus, useUnderstandData } from "../../components/understand/useUnderstandData";
import { loadUnderstandIndex } from "../../data/v2/understandV2";

export default function UnderstandModulesPage() {
  const { data, error } = useUnderstandData(loadUnderstandIndex); useTargetFocus(undefined, Boolean(data));
  if (error) return <UnderstandErrorState message="Le sommaire des modules ne peut pas être chargé." />;
  if (!data) return <UnderstandLoadingState />;
  return <main className="understand-page"><div className="understand-page__inner"><UnderstandBreadcrumbs current="Modules" /><header className="understand-header"><h1 id="understand-page-title" tabIndex={-1}>Les douze modules</h1><p>Chaque module peut être ouvert directement. Les dépendances indiquées sont des recommandations, jamais des conditions d’accès.</p></header>{data.groups.map((group) => <section className="understand-group" key={group.id} aria-labelledby={`modules-${group.id}`}><h2 id={`modules-${group.id}`}>{group.label}</h2><p>{group.directQuestion}</p><div className="understand-card-grid">{data.modules.filter(({ groupId }) => groupId === group.id).map((module) => <UnderstandModuleCard key={module.id} module={module} group={group.label} />)}</div></section>)}<p><a href="#/comprendre">Retour à Comprendre</a></p></div></main>;
}
