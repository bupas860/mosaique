export type ParcoursId =
  | "lgbti"
  | "handicap-validisme"
  | "egalite-filles-garcons"
  | "racisme";

export type ParcoursStatus = "active" | "planned";

export interface ParcoursDefinition {
  readonly id: ParcoursId;
  readonly slug: string;
  readonly publicLabel: string;
  readonly title: string;
  readonly description: string;
  readonly status: ParcoursStatus;
}

export const parcoursCatalog = [
  {
    id: "lgbti",
    slug: "lgbti",
    publicLabel: "LGBTI+",
    title: "LGBTI-phobies, orientations, identités et expressions de genre",
    description: "Situations scolaires liées aux LGBTI-phobies, aux normes de genre et à leurs intersections avec d’autres rapports sociaux.",
    status: "active",
  },
  {
    id: "handicap-validisme",
    slug: "handicap-validisme",
    publicLabel: "Handicap et validisme",
    title: "Handicap, accessibilité et validisme",
    description: "Parcours futur consacré aux obstacles matériels, organisationnels, relationnels et culturels liés au handicap et au validisme.",
    status: "planned",
  },
  {
    id: "egalite-filles-garcons",
    slug: "egalite-filles-garcons",
    publicLabel: "Égalité filles-garçons",
    title: "Sexisme et égalité filles-garçons",
    description: "Parcours futur consacré aux normes de genre, au sexisme et aux inégalités entre les filles et les garçons.",
    status: "planned",
  },
  {
    id: "racisme",
    slug: "racisme",
    publicLabel: "Racisme",
    title: "Racisme et discriminations raciales",
    description: "Parcours futur consacré aux mécanismes de racialisation, aux discriminations raciales et à leurs effets dans les parcours scolaires.",
    status: "planned",
  },
] as const satisfies readonly ParcoursDefinition[];

export const DEFAULT_PARCOURS_ID: ParcoursId = "lgbti";
export const currentParcours = parcoursCatalog[0];
