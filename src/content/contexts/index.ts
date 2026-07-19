import { educationNationalContexts } from "./education-national";
import { sportAndDailyLifeContexts } from "./sport-and-daily-life";

export const narrativeContexts = [
  ...educationNationalContexts,
  ...sportAndDailyLifeContexts,
];

export type { NarrativeContext } from "./types";
