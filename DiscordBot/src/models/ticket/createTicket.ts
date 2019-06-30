import { Ticket } from "./ticket";

export interface CreateTicket extends Ticket {
    id: number;
}

export class CreateTicket implements CreateTicket {

}