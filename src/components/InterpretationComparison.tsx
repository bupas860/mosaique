interface Props {
  id: string;
  isCoherent: boolean;
  playerMovement: string;
  proposedMovement: string;
}

export default function InterpretationComparison({ id, isCoherent, playerMovement, proposedMovement }: Props) {
  return <section aria-labelledby={id} className="interpretation-comparison">
    <h3 id={id} className="sr-only">Comparaison avec l’interprétation proposée</h3>
    <div className="interpretation-comparison__readings">
      <article className="interpretation-reading interpretation-reading--player"><h4>Votre lecture</h4><p>{playerMovement}.</p></article>
      <article className="interpretation-reading interpretation-reading--proposed"><h4>Interprétation proposée</h4><p>{proposedMovement}.</p></article>
    </div>
    <p className={`interpretation-status interpretation-status--${isCoherent ? "concordant" : "different"}`}><strong>{isCoherent ? "Lecture concordante" : "Lecture différente"}</strong><span>{isCoherent ? "✓ Votre lecture rejoint l’interprétation proposée." : "Votre lecture diffère de l’interprétation proposée."}</span></p>
  </section>;
}
