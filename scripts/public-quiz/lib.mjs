import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CHARACTER_OUTPUT = path.join(ROOT, "src/data/public/publicCharacterQuiz.generated.json");
export const SITUATION_OUTPUT = path.join(ROOT, "src/data/public/publicSituationQuiz.generated.json");
export const SITUATION_ORDER = ["N02", "V10", "X01", "I01", "N13", "X13", "V01", "I14"];
const PUBLIC_SITUATIONS = path.join(ROOT, "src/data/public/publicSituations.generated.ts");

function docsRoot() {
  const candidates = [process.env.MOSAIQUE_IMPORT_DIR, path.resolve(ROOT, "../mosaique-import")].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Sources quiz introuvables. Définir MOSAIQUE_IMPORT_DIR ou placer mosaique-import à côté du dépôt.");
  return found;
}

function sources() {
  const root = docsRoot();
  return {
    characters: path.join(root, "public-lyceen/situations/096_Mosaique_Public_lyceen_Quiz_personnages_V2.md"),
    situations: path.join(root, "public-lyceen/situations/097_Mosaique_Public_lyceen_Quiz_situations_V3.md"),
    register: path.join(root, "public-lyceen/situations/098_Mosaique_Public_lyceen_Registre_quiz_et_tracabilite_V3.md"),
  };
}

const read = (filename) => {
  if (!existsSync(filename)) throw new Error(`Source requise absente : ${filename}`);
  return readFileSync(filename, "utf8").replace(/\r\n/g, "\n");
};
const clean = (value) => value.trim().replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/<br>/g, "\n");
function cell(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const value = block.match(new RegExp(`^\\| ${escaped} \\| (.+) \\|$`, "m"))?.[1];
  if (!value) throw new Error(`Champ ${label} absent`);
  return clean(value);
}
function sections(markdown, pattern) {
  const headings = [...markdown.matchAll(pattern)];
  return headings.map((heading, index) => ({ heading, block: markdown.slice(heading.index, headings[index + 1]?.index ?? markdown.length) }));
}
function options(value) {
  const bold = [...value.matchAll(/\*\*([A-F])\.\*\*\s*([\s\S]*?)(?=<br>|$)/g)].map((match) => ({ id: match[1], label: clean(match[2]) }));
  if (bold.length) return bold;
  return clean(value).replace(/\.$/, "").split(/\s*;\s*/).map((label, index) => ({ id: index === 0 ? "V" : "F", label }));
}
function expectedIds(value) {
  if (value.includes("→")) return value.split(/\s*;\s*/).map((item) => clean(item));
  if (/^Vrai\.?$/i.test(clean(value))) return ["V"];
  return [...value.matchAll(/\b([A-F])\b/g)].map((match) => match[1]);
}
function usefulWords(value) { return [...value.matchAll(/\[(MU-[A-Z]+) — ([^\]]+)\]/g)].map((match) => ({ id: match[1], label: match[2] })); }

function characterQuiz(markdown) {
  const questions = sections(markdown, /^# (QP\d{2}) — (.+)$/gm).map(({ heading, block }) => {
    const rawChoices = block.match(/^\| Choix proposés \| (.+) \|$/m)?.[1];
    if (!rawChoices) throw new Error(`${heading[1]} : choix absents`);
    const format = cell(block, "Format");
    const association = heading[1] === "QP05";
    return {
      id: heading[1], title: heading[2].trim(), format, introduction: cell(block, "Introduction éventuelle"), question: cell(block, "Question publique"), instruction: cell(block, "Consigne de réponse"),
      responseType: association ? "association" : format.includes("plusieurs") ? "multiple" : "single",
      options: association ? ["coming in", "coming out", "outing"].map((label) => ({ id: label, label })) : options(rawChoices),
      associationPrompts: association ? [...rawChoices.matchAll(/\*\*(\d)\.\*\*\s*([\s\S]*?)(?=<br>|$)/g)].map((match) => ({ id: match[1], label: clean(match[2]) })) : [],
      expected: expectedIds(cell(block, "Réponse attendue")), feedback: cell(block, "Feedback principal"), remember: cell(block, "À retenir"), usefulWords: usefulWords(cell(block, "Renvoi")),
    };
  });
  if (questions.length !== 8) throw new Error(`096 V2 : huit questions attendues, ${questions.length} trouvées`);
  return { title: "Quiz Personnages", meta: "8 questions — environ 4 à 6 minutes", introduction: "Retrouve les distinctions utiles pour lire les biographies de Mosaïque. Une correction expliquée apparaît après chaque question. Tu peux prendre le temps de la relire, puis recommencer la même série.", questions };
}

function situationQuiz(markdown) {
  const questions = sections(markdown, /^# Situation (\d) sur 8$/gm).map(({ heading, block }) => {
    const presentation = block.match(/^\| Présentation avant validation \| (.+) \|$/m)?.[1] ?? "";
    const reveal = cell(block, "Révélation après validation").replace(/^Code et titre :\s*/, "").replace(/\.$/, "");
    const [code, ...titleParts] = reveal.split(" — ");
    const answer = cell(block, "Réponse attendue").replace(/\.$/, "").split(/\s*;\s*/);
    const feedback = cell(block, "Feedback principal").split(/\n\n/);
    const altText = clean(presentation.match(/\*\*Texte alternatif validé :\*\* ([\s\S]*?)<br>\*\*Texte canonique :\*\*/)?.[1] ?? "");
    const canonicalText = clean(presentation.match(/\*\*Texte canonique :\*\* ([\s\S]*)$/)?.[1] ?? "").replace(/ • /g, "\n• ");
    if (!altText || !canonicalText) throw new Error(`${code} : présentation publique incomplète`);
    return { position: Number(heading[1]), code, title: titleParts.join(" — "), illustrationFile: `${code.toLowerCase()}.webp`, altText, canonicalText, expectedFocal: answer[0], expectedRole: answer[1], feedback, remember: cell(block, "À retenir") };
  });
  if (questions.map(({ code }) => code).join() !== SITUATION_ORDER.join()) throw new Error("097 V3 : ordre des huit situations invalide");
  return { title: "Quiz Situations", meta: "8 situations — deux réponses pour chaque situation", questions };
}

export function buildPublicQuizzes() {
  const paths = sources();
  const characters = characterQuiz(read(paths.characters));
  const situations = situationQuiz(read(paths.situations));
  const publicSource = read(PUBLIC_SITUATIONS);
  const publicArray = publicSource.match(/export const publicSituations = (\[[\s\S]*\]) as const satisfies readonly PublicSituation\[\];/)?.[1];
  if (!publicArray) throw new Error("Artefact public Situations illisible");
  const publicSituations = JSON.parse(publicArray);
  situations.questions = situations.questions.map((question) => {
    const publicSituation = publicSituations.find(({ code }) => code === question.code);
    if (!publicSituation) throw new Error(`${question.code} absent du corpus public Situations`);
    const comparable = (value) => value.replace(/\s+/g, " ").trim();
    for (const field of ["title", "altText", "canonicalText"]) if (comparable(question[field]) !== comparable(publicSituation[field])) throw new Error(`${question.code} : ${field} diffère du corpus public`);
    if (question.expectedFocal !== publicSituation.focalLabel || question.expectedRole !== publicSituation.role) throw new Error(`${question.code} : focale ou rôle diffère du corpus public`);
    return { ...question, title: publicSituation.title, illustrationFile: publicSituation.illustrationFile, altText: publicSituation.altText, canonicalText: publicSituation.canonicalText };
  });
  const register = read(paths.register);
  for (const id of [...characters.questions.map(({ id }) => id), ...situations.questions.map((_, index) => `QS${String(index + 1).padStart(2, "0")}`)]) if (!register.includes(id)) throw new Error(`098 V3 : identifiant absent ${id}`);
  if (!register.includes("Vigilance propre au quiz") || !register.includes("I01 reste également non datée")) throw new Error("098 V3 : vigilance I01 absente");
  return { characters, situations };
}

const generated = (key, value) => `${JSON.stringify({ generatedNotice: "Fichier généré. Ne pas modifier manuellement.", [key]: value }, null, 2)}\n`;
export const generatedCharacterQuiz = (data) => generated("quiz", data.characters);
export const generatedSituationQuiz = (data) => generated("quiz", data.situations);
