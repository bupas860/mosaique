interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const percent = (current / total) * 100;

  return (
    <section className="mb-6">
      <div className="mb-2 flex justify-between text-sm text-slate-600">
        <span>Situation {current} sur {total}</span>
        <span>{Math.round(percent)} %</span>
      </div>

      <div className="h-3 rounded-full bg-slate-200">
        <div
          className="h-3 rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}
