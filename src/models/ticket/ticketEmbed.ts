import { ticket } from "./ticket";
import { discordUser } from "../discordUser";

export default interface TicketEmbed {
    ticket:ticket;
    user:discordUser;
}