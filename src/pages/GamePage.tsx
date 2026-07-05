import Screen from "../components/Screen";
import { firstSituation } from "../data/demo";

export default function GamePage() {
  return (
    <Screen>
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold">
          {firstSituation.title}
        </h1>

        <p className="text-xl text-slate-600">
          {firstSituation.text}
        </p>
      </div>
    </Screen>
  );
}
