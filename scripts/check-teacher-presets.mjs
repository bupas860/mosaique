/**
 * Garde-fou sur les propositions thématiques : validation des 10 situations,
 * personnages, règles de composition et équilibre des marches par personnage.
 *
 * Aucun public n'est classé par âge ou niveau d'enseignement.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const presets = readJson('../src/features/teacher/pedagogicalPresets.json');
const bankNames = ['visible-obstacles', 'ordinary-norms', 'invisible-effects', 'intersectionalities'];
const banks = Object.fromEntries(bankNames.map((mode) => [mode, readJson(`../src/data/generated-v2/modes/${mode}.json`)]));
const discoveryRules = readJson('../src/data/generated-v2/modes/discovery.json').rules;
const byId = new Map(bankNames.flatMap((mode) => banks[mode].situations.map((s) => [s.id, s])));
const modeNames = new Set(['discovery', ...bankNames]);
const names = new Set();
const subjects = new Set();

function meetsRequirement(ids, req = {}) {
  if (req.all && req.all.some((id) => !ids.has(id))) return false;
  if (req.any && !req.any.some((id) => ids.has(id))) return false;
  if (req.atLeast && req.atLeast.ids.filter((id) => ids.has(id)).length < req.atLeast.count) return false;
  return true;
}

for (const preset of presets) {
  const { id, title, description, mode, situationIds, characterIds } = preset;
  assert.match(id, /^[a-z]+(?:-[a-z]+)+$/);
  assert(!names.has(id), `Identifiant de proposition répété : ${id}`);
  names.add(id);
  assert(typeof title === 'string' && title.length > 12);
  assert(typeof description === 'string' && description.length > 30);
  assert(!/collège|lycée|université|enseignement supérieur|école primaire/i.test(title + ' ' + description),
    `Aucune étiquette d'âge ou de public imposée : ${id}`);
  assert(modeNames.has(mode), `Mode inconnu : ${mode}`);
  subjects.add(mode);

  assert(Array.isArray(situationIds) && situationIds.length === 10 && new Set(situationIds).size === 10,
    `La proposition ${id} doit comporter 10 situations distinctes`);
  assert(Array.isArray(characterIds) && characterIds.length >= 1 &&
    new Set(characterIds).size === characterIds.length, `Personnages invalides pour ${id}`);

  const ids = new Set(situationIds);
  const situations = situationIds.map((sid) => {
    const s = byId.get(sid);
    assert(s && (mode === 'discovery' ? s.modeId !== 'intersectionalities' : s.modeId === mode),
      `Situation absente ou hors mode dans ${id} : ${sid}`);
    return s;
  });
  const prefix = mode === 'intersectionalities' ? 'XP' : 'P';
  for (const character of characterIds) {
    assert(character.startsWith(prefix), `Personnage de galerie incompatible : ${id}/${character}`);
    for (const s of situations) {
      assert(s.effectsByCharacter[character] &&
        s.feedbacksByCharacter[character]?.decision === s.effectsByCharacter[character],
        `Pas de retour pour ${id}/${s.id}/${character}`);
    }
    const stayed = situations.filter((s) => s.effectsByCharacter[character] === 'stay').length;
    assert(stayed >= 2 && stayed <= 8, `Marche peu contrastée dans ${id} pour ${character} : ${stayed}`);
  }

  const protections = situations.filter((s) => s.protective).length;
  assert.equal(protections, 2, `Deux situations protectrices attendues dans ${id}`);

  if (mode === 'discovery') {
    for (const [family, required] of Object.entries(discoveryRules.quotas)) {
      assert.equal(situations.filter((s) => s.modeId === family).length, required,
        `Quota non respecté : ${id}/${family}`);
    }
    for (const character of characterIds) {
      assert(meetsRequirement(ids, discoveryRules.characterRequirements[character]),
        `Exigence du personnage non respectée : ${id}/${character}`);
    }
  } else {
    const rules = banks[mode].rules;
    for (const required of rules.mandatorySituationIds) {
      assert(ids.has(required), `Situation protectrice normalement obligatoire absente : ${id}/${required}`);
    }
    for (const group of rules.requiredGroups) {
      assert(group.situationIds.filter((sid) => ids.has(sid)).length >= group.minimum,
        `Groupe nécessaire insuffisant : ${id}/${group.id}`);
    }
    for (const group of rules.limitedGroups) {
      assert(group.situationIds.filter((sid) => ids.has(sid)).length <= group.maximum,
        `Groupe surreprésenté : ${id}/${group.id}`);
    }
    for (const character of characterIds) {
      assert(meetsRequirement(ids, rules.characterRequirements[character]),
        `Exigence du personnage non respectée : ${id}/${character}`);
    }
  }
  console.log(`✓ ${title} — ${situationIds.length} situations, ${characterIds.length} personnages, ${protections} protections`);
}
assert.equal(presets.length, 7, 'Les sept propositions thématiques doivent être présentes');
assert.equal(subjects.size, 5, 'Les cinq modes doivent être représentés');
console.log('Propositions thématiques : 7 vérifiées sur les 5 modes, sans étiquetage par âge.');
