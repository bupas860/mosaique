import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));

export const GALLERIES = {
  general: {
    id: "general",
    documentId: "mosaique-gallery-characters-v2",
    sourceFile: "docs/editorial-v2/010_Galerie_des_personnages_V2.md",
    idPrefix: "P",
    count: 9,
  },
  intersectional: {
    id: "intersectional",
    documentId: "mosaique-intersectional-characters-v1",
    sourceFile: "docs/editorial-v2/015_Galerie_Intersectionnalites_V1.md",
    idPrefix: "XP",
    count: 8,
  },
};

const range = (prefix, count) =>
  Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(2, "0")}`);

export const MODES = {
  "visible-obstacles": {
    id: "visible-obstacles",
    documentId: "mosaique-mode-visible-obstacles-v1",
    sourceFile: "docs/editorial-v2/100_Mode_Obstacles_visibles_V1.md",
    galleryId: "general",
    prefix: "V",
    situationCount: 16,
    feedbackCount: 144,
    mandatoryIds: ["V09", "V10"],
    variableCount: 8,
    requiredGroups: [
      ["V01", "V02"],
      ["V03", "V04", "V12"],
      ["V05", "V13", "V14", "V15"],
      ["V06", "V07"],
    ],
    limitedGroups: [{ situationIds: ["V05", "V13", "V14", "V15"], maximum: 2 }],
    obstacleRange: [1, 7],
  },
  "ordinary-norms": {
    id: "ordinary-norms",
    documentId: "mosaique-mode-ordinary-norms-v1",
    sourceFile: "docs/editorial-v2/110_Mode_Normes_ordinaires_V1.md",
    galleryId: "general",
    prefix: "N",
    situationCount: 13,
    feedbackCount: 117,
    mandatoryIds: ["N12", "N13"],
    variableCount: 8,
    requiredGroups: [
      ["N01", "N02", "N03"],
      ["N04", "N05", "N11"],
      ["N06", "N07"],
      ["N08", "N09", "N10"],
    ],
    limitedGroups: [
      { situationIds: ["N04", "N05", "N11"], maximum: 2 },
      { situationIds: ["N08", "N09", "N10"], maximum: 2 },
    ],
    obstacleRange: [1, 7],
  },
  "invisible-effects": {
    id: "invisible-effects",
    documentId: "mosaique-mode-invisible-effects-v1",
    sourceFile: "docs/editorial-v2/120_Mode_Effets_invisibles_V1.md",
    galleryId: "general",
    prefix: "I",
    situationCount: 16,
    feedbackCount: 144,
    mandatoryIds: ["I14", "I15"],
    variableCount: 8,
    requiredGroups: [
      ["I01", "I02", "I03", "I04"],
      ["I05", "I06", "I07", "I08", "I09", "I10", "I11"],
      ["I12", "I13"],
    ],
    limitedGroups: [
      { situationIds: ["I01", "I03", "I04"], maximum: 2 },
      { situationIds: ["I06", "I07", "I08", "I09", "I10", "I11"], maximum: 3 },
    ],
    characterRequirements: { P04: { all: ["I16"] } },
    obstacleRange: [1, 7],
  },
  intersectionalities: {
    id: "intersectionalities",
    documentId: "mosaique-mode-intersectionalities-v1",
    sourceFile: "docs/editorial-v2/130_Mode_Intersectionnalites_V1.md",
    galleryId: "intersectional",
    prefix: "X",
    situationCount: 16,
    feedbackCount: 128,
    mandatoryIds: ["X13", "X14"],
    variableCount: 8,
    requiredGroups: [
      ["X01", "X02", "X04", "X12"],
      ["X03", "X05", "X06", "X10", "X15"],
      ["X01", "X02", "X04", "X05", "X06", "X08", "X09", "X10", "X11", "X15"],
      ["X01", "X07", "X08", "X11", "X12", "X16"],
    ],
    limitedGroups: [],
    characterRequirements: {
      XP01: { atLeast: { count: 2, ids: ["X01", "X11", "X12"] } },
      XP02: { atLeast: { count: 2, ids: ["X02", "X09", "X12"] } },
      XP03: { all: ["X03", "X10"] },
      XP04: { all: ["X04", "X12"] },
      XP05: { all: ["X05", "X09"] },
      XP06: { all: ["X06", "X15"] },
      XP07: { all: ["X07", "X16"] },
      XP08: { atLeast: { count: 2, ids: ["X08", "X11", "X12"] } },
    },
    obstacleRange: [2, 5],
  },
  discovery: {
    id: "discovery",
    documentId: "mosaique-mode-discovery-v1",
    sourceFile: "docs/editorial-v2/140_Mode_Decouverte_V1.md",
    galleryId: "general",
    prefix: null,
    situationCount: 0,
    feedbackCount: 0,
    sourceModes: ["visible-obstacles", "ordinary-norms", "invisible-effects"],
    quotas: { "visible-obstacles": 3, "ordinary-norms": 3, "invisible-effects": 4 },
    protectiveCount: 2,
    obstacleRange: [3, 7],
    characterRequirements: { P04: { all: ["I16"] }, P02: { any: ["I12", "I13"] }, P06: { any: ["I12", "I13"] }, P07: { all: ["I13"] } },
  },
};

for (const gallery of Object.values(GALLERIES)) gallery.characterIds = range(gallery.idPrefix, gallery.count);
for (const mode of Object.values(MODES)) {
  mode.situationIds = mode.prefix ? range(mode.prefix, mode.situationCount) : [];
  mode.variableIds = mode.situationIds.filter((id) => !mode.mandatoryIds?.includes(id));
}

export const SOURCE_FILES = [
  ...Object.values(GALLERIES).map(({ sourceFile }) => sourceFile),
  ...Object.values(MODES).map(({ sourceFile }) => sourceFile),
];

export const EXPECTED_SELECTION_COUNTS = {
  "visible-obstacles": { thematic: 1300, allCharacters: 1123 },
  "ordinary-norms": { thematic: 63, P01: 63, P02: 63, P03: 63, P04: 60, P05: 63, P06: 63, P07: 63, P08: 63, P09: 63 },
  "invisible-effects": { thematic: 1148, P01: 1148, P02: 1118, P03: 1148, P04: 803, P05: 1138, P06: 968, P07: 1148, P08: 1148, P09: 1148 },
  intersectionalities: { XP01: 1839, XP02: 1838, XP03: 895, XP04: 917, XP05: 895, XP06: 895, XP07: 889, XP08: 1811 },
  discovery: { P01: 26247600, P02: 11309000, P03: 36676512, P04: 3538000, P05: 12479516, P06: 9022040, P07: 2931328, P08: 15324160, P09: 27302144 },
};
