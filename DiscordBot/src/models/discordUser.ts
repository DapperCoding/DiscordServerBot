import { CompactDiscordUser } from "./compactDiscordUser";
import { Proficiency } from "./proficiency/proficiency";

export interface DiscordUser extends CompactDiscordUser {
  name: string;
  proficiencies: Proficiency[];
}

export class DiscordUser implements DiscordUser {

}
