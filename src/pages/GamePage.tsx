import Button from "../components/Button";
import Screen from "../components/Screen";
import { firstSituation } from "../data/firstSituation";

export default function GamePage() {
  return (
    <Screen>
      <div className="mx-auto max-w-xl space-y-8 text-center">
        <h1 className="text-4xl font-bold">
          {firstSituation.title}
        </h1>

        <p className="text-lg text-slate-700">
          {firstSituation.text}
        </p>

        <div className="flex flex-col gap-4">
          {firstSituation.choices.map((choice) => (
            <Button key={choice.id}>
              {choice.label}
            </Button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
