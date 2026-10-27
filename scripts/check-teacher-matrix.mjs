import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const tags = read('../src/features/teacher/situationMatrixTaxonomy.json');
const modes = ['visible-obstacles','ordinary-norms','invisible-effects','intersectionalities'];
const banks = modes.map(mode => read('../src/data/generated-v2/modes/'+mode+'.json'));
const all = banks.flatMap(bank => bank.situations);
const original = new Set(all.map(card => card.id));
assert.equal(original.size,61);
assert.deepEqual(new Set(Object.keys(tags)),original);
const validAngles = new Set(['parole','organisation','representation','confidentialite','protection']);
const validDimensions = new Set(['orientation','identite','expression','sexe']);
for(const card of all){
 const t=tags[card.id];
 assert(Array.isArray(t.approaches) && Array.isArray(t.dimensions));
 assert(t.approaches.every(code => validAngles.has(code)));
 assert(t.dimensions.every(code => validDimensions.has(code)));
 assert.equal(new Set(t.approaches).size,t.approaches.length);
 assert.equal(new Set(t.dimensions).size,t.dimensions.length);
 if(card.modeId==='intersectionalities') assert.equal(t.approaches.length,0);
 else assert(t.approaches.length>0);
}
for(const bank of banks.slice(0,3)){
 for(const card of bank.situations) assert(tags[card.id].approaches.length>0);
 console.log('✓',bank.modeId,bank.situations.length);
}
const intersection = banks[3].situations;
const presets = read('../src/features/teacher/pedagogicalPresets.json').filter(p=>p.mode==='intersectionalities');
const listed = new Set(presets.flatMap(p=>p.situationIds));
const others = intersection.filter(c=>!listed.has(c.id));
assert.deepEqual(new Set([...listed,...others.map(c=>c.id)]),new Set(intersection.map(c=>c.id)));
console.log('✓ Intersectionnalités séparées :',intersection.length,'; hors propositions :',others.map(c=>c.id).join(','));
console.log('MATRIX_61_VALIDATED');
