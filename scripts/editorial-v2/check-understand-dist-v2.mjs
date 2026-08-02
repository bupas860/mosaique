import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const assets = path.join(root, "dist", "assets");
const assetNames = (await readdir(assets)).filter((name) => name.endsWith(".js"));
const files = new Map(await Promise.all(assetNames.map(async (name) => [name, await readFile(path.join(assets, name), "utf8")])));
const all = [...files.values()].join("\n");
for (const forbidden of [
  "Ce que Mosaïque met en jeu",
  "Utiliser Mosaïque en formation",
  "Acte observable",
  "Entrer dans Mosaïque",
]) if (all.includes(forbidden)) throw new Error(`Contenu Comprendre présent dans le build public : ${forbidden}`);
if (assetNames.some((name) => /Understand|understand|glossary|bibliography|^m(?:0[1-9]|1[0-2])-/i.test(name))) throw new Error("Chunk Comprendre historique présent dans le build public");
for (const forbidden of [/Dossier_de_recherche/i, /Audit_et_Architecture/i, /Audit_harmonisation/i, /Gabarit_editorial/i, /\bDR\d{3}\b/, /Volet réservé au formateur/i, /\/home\//]) if (forbidden.test(all)) throw new Error(`Contenu interdit dans dist : ${forbidden}`);
console.log(JSON.stringify({ javascriptChunks: assetNames.length, understandChunks: 0, historicalContentLoaded: false }, null, 2));
