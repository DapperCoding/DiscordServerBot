import { message } from "../message";

export interface ticketReaction {
    ticketId: number;
    fromId: string;
    username:string;
    discordMessage: message;
}

export class ticketReaction implements ticketReaction {

}