import { ticket } from "./ticket";

export interface createTicket extends ticket {
    id: number;
}

export class createTicket implements createTicket {

}