import { compactDiscordUser } from "./compactDiscordUser";
import { proficiency } from "./proficiency/proficiency";

export interface discordUser extends compactDiscordUser {
  name: string;
  proficiencies: proficiency[];
}

export class discordUser implements discordUser {}
