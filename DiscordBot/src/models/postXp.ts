import { CompactDiscordUser } from './compactDiscordUser';
import { CompactPostXp } from './compactPostXp';

export interface PostXp extends CompactDiscordUser, CompactPostXp {

}

export class PostXp implements PostXp {

}