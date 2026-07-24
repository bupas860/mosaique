interface Props {
  id: string;
  isCoherent: boolean;
  playerInterpretation: string;
  playerMovement: string;
  proposedInterpretation: string;
  proposedMovement: string;
}

function movementIcon(movement: string) {
  if (movement.includes("avance")) {
    return "→";
  }

  if (movement.includes("recule")) {
    return "←";
  }

  return "Ⅱ";
}

interface MovementProps {
  label: string;
  movement: string;
  variant: "player" | "proposed";
}

function Movement({ label, movement, variant }: MovementProps) {
  const colors = variant === "player"
    ? "border-blue-200 bg-blue-100/70 text-blue-950"
    : "border-teal-200 bg-teal-100/70 text-teal-950";

  return (
    <div className={`mt-5 rounded-lg border p-3.5 ${colors}`}>
      <h5 className="text-xs font-bold uppercase tracking-wide opacity-80">
        {label}
      </h5>
      <p className="mt-2 flex items-center gap-2.5 text-base font-extrabold sm:text-lg">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-xl shadow-sm"
        >
          {movementIcon(movement)}
        </span>
        <span>{movement}.</span>
      </p>
    </div>
  );
}

export default function InterpretationComparison({
  id,
  isCoherent,
  playerInterpretation,
  playerMovement,
  proposedInterpretation,
  proposedMovement,
}: Props) {
  return (
    <section aria-labelledby={id} className="pt-1">
      <h3 id={id} className="mb-4 text-sm font-semibold text-slate-500">
        Comparaison des interprétations
      </h3>

      <div className="grid items-stretch gap-4 md:grid-cols-2">
        <article className="flex h-full flex-col rounded-xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm sm:p-5">
          <h4 className="text-lg font-bold text-blue-950 sm:text-xl">
            Votre interprétation
          </h4>
          <p className="mt-3 flex-1 text-base font-medium leading-relaxed text-slate-900 sm:text-lg">
            {playerInterpretation}
          </p>
          <Movement
            label="Conséquence dans votre partie"
            movement={playerMovement}
            variant="player"
          />
        </article>

        <article className="flex h-full flex-col rounded-xl border border-teal-200 bg-teal-50/80 p-4 shadow-sm sm:p-5">
          <h4 className="text-lg font-bold text-teal-950 sm:text-xl">
            Interprétation proposée
          </h4>
          <p className="mt-3 flex-1 text-base font-medium leading-relaxed text-slate-900 sm:text-lg">
            {proposedInterpretation}
          </p>
          <Movement
            label="Déplacement cohérent avec cette interprétation"
            movement={proposedMovement}
            variant="proposed"
          />
        </article>
      </div>

      <p className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium leading-relaxed ${
        isCoherent
          ? "border-teal-200 bg-teal-50 text-teal-950"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}>
        <span aria-hidden="true" className="mr-2">
          {isCoherent ? "≈" : "↻"}
        </span>
        {isCoherent
          ? "Votre interprétation est cohérente avec l’interprétation proposée."
          : "Votre interprétation diffère de celle proposée. L’explication ci-dessous permet de comprendre cette lecture de la situation."}
      </p>
    </section>
  );
}
