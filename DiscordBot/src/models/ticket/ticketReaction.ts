import { Message } from "../message";

export interface TicketReaction {
    ticketId: number;
    fromId: string;
    username: string;
    discordMessage: Message;
}

export class TicketReaction implements TicketReaction {

}