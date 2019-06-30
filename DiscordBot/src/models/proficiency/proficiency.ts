import { DiscordUser } from "../discordUser";

export interface Proficiency {
  id: number;
  name: string;
  proficiencyType: ProficiencyType;
}

export interface DiscordUserProficiency {
  discordUserId: number;
  discordUser: DiscordUser;
  proficiencyId: number;
  proficiency: Proficiency;
  proficiencyLevel: ProficiencyLevel;
}

export enum ProficiencyType {
  Language = 0,
  Library = 1
}

export enum ProficiencyLevel {
  AbsoluteBeginner = 0,
  JustStarted = 1,
  Medior = 2,
  Senior = 3,
  Expert = 4
}
