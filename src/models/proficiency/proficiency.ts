import { discordUser } from "../discordUser";

export interface proficiency {
  id: number;
  name: string;
  proficiencyType: proficiencyType;
}

export interface discordUserProficiency {
  discordUserId: number;
  discordUser: discordUser;
  proficiencyId: number;
  proficiency: proficiency;
  proficiencyLevel: proficiencyLevel;
}

export enum proficiencyType {
  language = 0,
  library = 1
}

export enum proficiencyLevel {
  absoluteBeginner = 0,
  justStarted = 1,
  medior = 2,
  senior = 3,
  expert = 4
}
