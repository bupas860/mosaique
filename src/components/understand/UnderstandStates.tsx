import { useEffect, useRef } from "react";

export function UnderstandLoadingState() {
  return <main className="understand-state" aria-busy="true" aria-live="polite"><p>Chargement de Comprendre…</p></main>;
}

export function UnderstandErrorState({ message, modules = false }: { message: string; modules?: boolean }) {
  const title = useRef<HTMLHeadingElement>(null); useEffect(() => { title.current?.focus(); }, []);
  return <main className="understand-state"><div role="alert"><h1 ref={title} tabIndex={-1}>Contenu introuvable</h1><p>{message}</p><p><a href="#/comprendre">Retour à Comprendre</a>{modules && <> · <a href="#/comprendre/modules">Voir le sommaire</a></>}</p></div></main>;
}
