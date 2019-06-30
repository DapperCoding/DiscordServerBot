import { Ticket } from "./ticket";

export interface TicketReceive extends Ticket {
    id: number;
}

export class TicketReceive implements TicketReceive {

}