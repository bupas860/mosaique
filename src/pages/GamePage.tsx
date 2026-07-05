import Button from "../components/Button";
import Screen from "../components/Screen";
import { situations } from "../data/situations";

export default function GamePage() {
  const situation = situations[0];

  return (
    <Screen>
      <div className="mx-auto max-w-xl space-y-8 text-center">
        <h1 className="text-4xl font-bold">
          {situation.title}
        </h1>

        <p className="text-lg text-slate-700">
          {situation.text}
        </p>

        <div className="flex flex-col gap-4">
          {situation.choices.map((choice) => (
            <Button key={choice.id}>
              {choice.label}
            </Button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
