import { DiscordUser } from "../discordUser";

export interface CommissionFormBase {
  name: string;
  description: string;
  functionalitites: string;
  budget: string;
}

export interface CommissionForm extends CommissionFormBase {
  id: number;
  discordId: number;
  discordUser: DiscordUser;
  status: CommissionStatus;
}

export interface CommissionFormModel extends CommissionFormBase {
  discordDiscordId: string;
}

export enum CommissionStatus {
  notLookedAt = 0,
  talkingTo = 1,
  noDeal = 2,
  deal = 3,
  inProgress = 4,
  abandoned = 5,
  done = 6
}

export class CommissionForm implements CommissionForm {}

export class CommissionFormModel implements CommissionFormModel {}
