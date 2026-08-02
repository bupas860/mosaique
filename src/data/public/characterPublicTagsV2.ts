import type { EditorialCharacterIdV2 } from "../../types/editorialV2";

export const publicCharacterTagsV2 = {
  P01: ["Garçon trans", "hétérosexuel"],
  P02: ["Fille cisgenre", "lesbienne"],
  P03: ["Personne non binaire", "pansexuel·le", "Pronom : iel"],
  P04: ["Garçon cisgenre", "hétérosexuel"],
  P05: ["Fille cisgenre", "hétérosexuelle"],
  P06: ["Garçon cisgenre", "gay"],
  P07: ["Fille cisgenre", "aromantique et asexuelle"],
  P08: ["Fille cisgenre", "Lou présente une variation intersexe"],
  P09: ["Fille cisgenre", "bisexuelle"],
  XP01: ["fille trans", "utilise un fauteuil roulant", "Sa famille la soutient et son prénom est utilisé au lycée"],
  XP02: ["fille cisgenre", "lesbienne", "utilise un fauteuil roulant"],
  XP03: ["garçon cisgenre", "gay", "famille franco-marocaine"],
  XP04: ["personne non binaire", "autiste", "Charlie utilise le pronom « iel » et exprime clairement son identité"],
  XP05: ["fille noire", "lesbienne", "expression de genre masculine"],
  XP06: ["fille cisgenre", "vit avec ses deux mères, dont l’une est noire et l’autre blanche"],
  XP07: ["fille cisgenre", "intersexe", "Elle bénéficie d’un aménagement médical et souhaite limiter la circulation des informations sur son corps"],
  XP08: ["garçon trans", "vit en zone rurale et dépend de l’internat", "Son prénom administratif et la mention de sexe sur ses documents administratifs ne sont pas encore modifiés"],
} as const satisfies Readonly<Record<EditorialCharacterIdV2, readonly string[]>>;
