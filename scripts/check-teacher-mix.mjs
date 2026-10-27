import assert from "node:assert/strict";
import { rolldown } from "rolldown";
const bundler = await rolldown({
  input: "src/features/teacher/thematicMix.ts",
  plugins: [{
    name: "ignore-images-in-nonvisual-unit-test",
    load(id) {
      if (/\.(?:webp|png|svg|jpe?g)$/.test(id)) return { code: "export default null;" };
    },
  }],
});
const result = await bundler.generate({ format: "es" });
const source = result.output[0].code;
await bundler.close();
const { composeThematicMix, presetsForGallery } = await import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);
const g = presetsForGallery("general");
const x = presetsForGallery("intersectionalities");
assert.equal(g.length, 5);
assert.equal(x.length, 2);

const example = {
  "comprendre-mecanismes": 2,
  "paroles-actes-reactions": 1,
  "representations-invisibilisation": 2,
};
const stableRandom = () => 0.5;
const mix = composeThematicMix("general", example, stableRandom);
assert.equal(mix.mode, "discovery");
assert.equal(mix.characterIds.length, 9);
assert.equal(mix.situationIds.length, 5);
assert.equal(new Set(mix.situationIds).size, 5);
assert.deepEqual(mix.allocations.map(({ situationIds }) => situationIds.length), [2, 1, 2]);
for (const allocation of mix.allocations) {
  const pool = g.find(({ id }) => allocation.presetId === id).session.situationIds;
  assert(allocation.situationIds.every((id) => pool.includes(id)));
}
console.log("✓ Mélange 2 + 1 + 2 : 5 situations uniques issues des trois propositions.");

// Le même ID peut être listé deux fois dans les thématiques, mais jamais joué deux fois.
const overlap = composeThematicMix("general", {
  "comprendre-mecanismes": 5, "confidentialite-devoilement": 5,
}, stableRandom);
assert.equal(overlap.situationIds.length, 10);
assert.equal(new Set(overlap.situationIds).size, 10);
assert.deepEqual(overlap.allocations.map(({ situationIds }) => situationIds.length), [5, 5]);
console.log("✓ Deux propositions se recouvrant : quotas exacts, aucun doublon.");

const intersection = composeThematicMix("intersectionalities", {
  "identites-handicap-accessibilite": 5, "familles-croyances-assignations": 5,
}, stableRandom);
assert.equal(intersection.mode, "intersectionalities");
assert.equal(intersection.situationIds.length, 10);
assert.equal(new Set(intersection.situationIds).size, 10);
assert(intersection.situationIds.every((id) => id.startsWith("X")));
assert(intersection.characterIds.every((id) => id.startsWith("XP")));
console.log("✓ Intersectionnalités : composition propre à la galerie XP.");

assert.throws(() => composeThematicMix("general", { "comprendre-mecanismes": 7, "paroles-actes-reactions": 5 }), /entre une et dix/);
assert.throws(() => composeThematicMix("general", { "identites-handicap-accessibilite": 3 }), /n'appartient pas/);
assert.throws(() => composeThematicMix("general", {}), /entre une et dix/);
assert.throws(() => composeThematicMix("general", { "comprendre-mecanismes": 2.3 }), /entre une et dix/);
console.log("✓ Sommes invalides, galeries incompatibles et quotas non entiers rejetés.");

console.log("COMPOSEUR_THEMATIQUE_OK");
