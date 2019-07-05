import { CompactPostXp } from './compactPostXp';
import { DiscordUser } from '../discordUser';

export interface PostXp extends DiscordUser, CompactPostXp {

}

export class PostXp implements PostXp {

}