import { compactDiscordUser } from '../compactDiscordUser';
import { compactPostXp } from './compactPostXp';

export interface postXp extends compactDiscordUser, compactPostXp {

}

export class postXp implements postXp {

}