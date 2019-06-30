import { Ticket } from "./ticket";
import { DiscordUser } from "../discordUser";

export default interface TicketEmbed {
    ticket: Ticket;
    user: DiscordUser;
}