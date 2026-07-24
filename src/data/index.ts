import charactersJson from "./characters.json";
import gameConfigJson from "./game-config.json";
import matrixJson from "./matrix.json";
import mechanismsJson from "./mechanisms.json";
import situationCharacterFeedbacksJson from "./situation-character-feedbacks.json";
import situationsJson from "./situations.json";

import type { Character } from "../types/character";
import type { Situation } from "../types/situation";
import type {
  CharacterData,
  GameConfigData,
  GameMatrix,
  MechanismData,
  PedagogicalFeedback,
  SituationCharacterFeedbackData,
  SituationData,
} from "./types";

export const characterData = charactersJson as CharacterData[];
export const situationData = situationsJson as SituationData[];
export const mechanismData = mechanismsJson as MechanismData[];
export const matrix = matrixJson as GameMatrix;
export const gameConfig = gameConfigJson as GameConfigData;
const situationCharacterFeedbacks = situationCharacterFeedbacksJson as Partial<Record<
  SituationData["id"],
  Partial<Record<CharacterData["id"], SituationCharacterFeedbackData>>
>>;

const playerLabels: Record<string, string> = {
  accessible_buildings: "Locaux accessibles",
  administrative_confidentiality: "Confidentialité des informations administratives",
  binary_procedures_may_create_obstacle: "Procédures binaires pouvant créer un obstacle",
  bystander_reaction: "Réaction des témoins",
  combined_obstacle_factors: "Cumul de plusieurs facteurs pouvant créer des obstacles",
  disclosure_control: "Choix des informations personnelles partagées",
  disclosure_management: "Choix prudent des informations personnelles partagées",
  display_name_choice: "Choix du prénom affiché",
  diverse_family_representation: "Représentation de différentes configurations familiales",
  family_configuration_differs_from_expected_model: "Configuration familiale différente du modèle attendu",
  family_configuration_underrepresented: "Configuration familiale peu représentée",
  gendered_spaces_may_create_obstacle: "Espaces fortement genrés pouvant créer un obstacle",
  heterosexuality_assumption_exposure: "Exposition aux présupposés d’hétérosexualité",
  inclusive_forms: "Formulaires inclusifs",
  inclusive_language: "Langage inclusif",
  inclusive_organisation: "Organisation inclusive",
  inclusive_spaces: "Espaces inclusifs",
  legal_representative_is_not_parent: "Représentante légale différente des parents",
  matches_majority_norms: "Situation conforme aux normes majoritaires",
  motor_disability: "Handicap moteur",
  neutral_language: "Langage neutre",
  no_identity_related_obstacle_in_current_scope: "Pas de difficulté particulière liée à son identité dans ce parcours",
  non_binary_gender: "Identité de genre non binaire",
  non_gendered_spaces: "Espaces non genrés lorsque cela est possible",
  non_presupposing_family_language: "Langage sans présupposé sur la famille",
  non_visible_sexual_orientation: "Orientation affective non visible",
  open_forms: "Formulaires ouverts à différentes situations",
  open_questions: "Questions formulées sans présupposé",
  ordinary_procedures_match_situation: "Procédures ordinaires adaptées à sa situation",
  perceived_discrimination_risk: "Risque de discrimination ressenti",
  risk_of_involuntary_disclosure: "Risque que des informations personnelles soient révélées",
  same_sex_parent_family: "Famille homoparentale",
  social_transition: "Transition sociale",
  specific_pronouns: "Pronoms spécifiques",
  supportive_climate: "Climat bienveillant",
  trained_staff: "Personnel formé",
  trusting_climate: "Climat de confiance",
  use_usual_name: "Utilisation du prénom d’usage",
  usual_name_differs_from_administrative_name: "Prénom utilisé différent du prénom administratif",
};

function translatePlayerValues(values: string[], characterId: string): string[] {
  return values.flatMap((value) => {
    const label = playerLabels[value];

    if (label) {
      return [label];
    }

    if (import.meta.env.DEV) {
      console.warn(`Libellé français manquant pour ${value} (${characterId})`);
    }

    return [];
  });
}

function validateSituations(data: SituationData[]) {
  for (const situation of data) {
    for (const field of ["title", "text", "question"] as const) {
      if (situation[field].trim().length === 0) {
        throw new Error(`Situation incomplète : ${situation.id}.${field}`);
      }
    }
  }
}

validateSituations(situationData);

export const playableCharacters: Character[] = gameConfig.characterIds.map(
  (characterId) => {
    const character = characterData.find(({ id }) => id === characterId);

    if (!character) {
      throw new Error(`Personnage absent de characters.json : ${characterId}`);
    }

    return {
      id: character.id,
      name: character.name,
      age: character.age,
      schoolLevel: character.schoolLevel,
      genderIdentity: character.genderIdentity,
      affectiveAndSexualOrientation: character.affectiveAndSexualOrientation,
      pronouns: character.pronouns,
      characteristics: character.characteristics,
      traits: translatePlayerValues(character.traits, character.id),
      protectiveFactors: translatePlayerValues(character.protectiveFactors, character.id),
      color: character.accentColor,
      position: 0,
    };
  },
);

function createEffects(situationId: SituationData["id"]) {
  const results = matrix[situationId];

  if (!results) {
    throw new Error(`Situation absente de matrix.json : ${situationId}`);
  }

  return gameConfig.characterIds.map((characterId) => ({
    characterId,
    displacement: results[characterId],
  }));
}

function createPedagogicalFeedback(
  situation: SituationData,
  character: CharacterData,
): PedagogicalFeedback | undefined {
  const feedback = situationCharacterFeedbacks[situation.id]?.[character.id];

  if (!feedback) {
    if (import.meta.env.DEV) {
      console.warn(`Feedback pédagogique spécifique manquant : ${situation.id}/${character.id}`);
    }

    return undefined;
  }

  return {
    obstacle: feedback.obstacle,
    explanation: feedback.explanation,
    schoolGoodPractice: feedback.schoolGoodPractice,
    takeaway: feedback.takeaway,
  };
}

export const situations: Situation[] = gameConfig.situationIds.map(
  (situationId) => {
    const situation = situationData.find(({ id }) => id === situationId);

    if (!situation) {
      throw new Error(`Situation absente de situations.json : ${situationId}`);
    }

    const effects = createEffects(situation.id);

    return {
      id: situation.id,
      content: {
        common: {
          title: situation.title,
          description: situation.text,
          question: situation.question,
          image: situation.image ?? `/images/situations/${situation.id.toLowerCase()}.webp`,
        },
        ...Object.fromEntries(gameConfig.characterIds.map((characterId) => {
          const character = characterData.find(({ id }) => id === characterId);

          if (!character) {
            throw new Error(`Personnage absent de characters.json : ${characterId}`);
          }

          return [characterId, {
            title: situation.title,
            description: situation.text,
            question: situation.question,
            image: situation.image ?? `/images/situations/${situation.id.toLowerCase()}.webp`,
            pedagogicalFeedback: createPedagogicalFeedback(
              situation,
              character,
            ),
          }];
        })),
      },
      choices: gameConfig.answerOptions.map((answer) => ({
        id: answer.id,
        content: {
          common: {
            text: answer.label,
          },
        },
        effects,
      })),
    };
  },
);

export type {
  AnswerOption,
  CharacterData,
  CharacterId,
  GameConfigData,
  GameMatrix,
  MatrixResult,
  MechanismCategory,
  MechanismData,
  MechanismId,
  MechanismVisibility,
  PedagogicalFeedback,
  SituationCharacterFeedbackData,
  ResultSemantic,
  SituationData,
  SituationId,
} from "./types";
