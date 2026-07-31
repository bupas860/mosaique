export default function UnderstandBreadcrumbs({ current, modules = false }: { current: string; modules?: boolean }) {
  return <nav className="understand-breadcrumbs" aria-label="Fil d’Ariane"><ol><li><a href="#/">Accueil</a></li><li><a href="#/comprendre">Comprendre</a></li>{modules && <li><a href="#/comprendre/modules">Modules</a></li>}<li aria-current="page">{current}</li></ol></nav>;
}
