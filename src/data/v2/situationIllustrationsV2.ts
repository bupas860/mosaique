import v09Illustration from "../../assets/illustrations/situations/v09.webp";
import type { EditorialSituationIdV2 } from "../../types/editorialV2";

interface SituationIllustrationV2 {
  readonly source: string;
  readonly alt: string;
}

const situationIllustrationsV2 = {
  V09: {
    source: v09Illustration,
    alt: "Une enseignante rappelle le cadre devant une classe attentive.",
  },
} as const satisfies Readonly<
  Partial<Record<EditorialSituationIdV2, SituationIllustrationV2>>
>;

export function getSituationIllustrationV2(
  situationId: EditorialSituationIdV2,
): SituationIllustrationV2 | undefined {
  return situationIllustrationsV2[
    situationId as keyof typeof situationIllustrationsV2
  ];
}
