import { ticket } from "./ticket";

export interface ticketReceive extends ticket {
    id: number;
}

export class ticketReceive implements ticketReceive {

}