import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (filename) => readFile(path.join(root, filename), "utf8");
const requireText = (content, expected, label) => {
  if (!content.includes(expected)) throw new Error(`${label} absent : ${expected}`);
};

execFileSync("git", ["diff", "--exit-code", "HEAD", "--", "src/engine", "src/data/v2", "src/data/gameModes.ts", "src/types/editorialV2.ts", "src/types/runtimeV2.ts"], { cwd: root, stdio: "inherit" });

const card = await read("src/components/SituationCard.tsx");
requireText(card, 'onClick={() => onDecision("stay")}>Oui — {characterName} reste sur place', "Convention obstacle");
requireText(card, 'onClick={() => onDecision("advance")}>Non — {characterName} avance', "Convention absence d’obstacle");

const game = await read("src/pages/GamePage.tsx");
requireText(game, "position: character.position + movementDecisionToStep(decision)", "Progression Jouer");
requireText(game, "playerDecision === proposedDecision", "Comparaison des lectures");
requireText(game, "createActiveGameSet(selectedModeId, selectedCharacterId)", "Nouveau tirage Rejouer");

const summary = await read("src/pages/FinalSummaryPage.tsx");
requireText(summary, "position + movementDecisionToStep(decision)", "Positions proposées du bilan");
requireText(summary, "position + movementDecisionToStep(entry.playerDecision)", "Parcours numéroté du bilan");

console.log("Parité UI/moteur : sources moteur et données runtime inchangées par rapport à HEAD.");
console.log("Obstacle → reste sur place, absence d’obstacle → avance, progression et bilan : correspondances contrôlées.");
