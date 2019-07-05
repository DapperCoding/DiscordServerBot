import { Proficiency } from "./proficiency/proficiency";

export interface DiscordUser {
  discordId: string;
  username: string;
  name: string;
  proficiencies: Proficiency[];
}

export class DiscordUser implements DiscordUser {

}
