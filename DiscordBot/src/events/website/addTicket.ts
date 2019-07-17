import { ChannelHandler } from "../../handlers/channelHandler";
import { Guild } from "discord.js";
import { Ticket } from "../../models/ticket/ticket";

export class AddTicketEvent {
  public static handle(server: Guild, ticket: Ticket) {
    // Create new channel handler
    let handler = new ChannelHandler(server);

    // Get applicant as memebr
    let user = server.members.find(
      member => member.user.id === ticket.applicant.discordId
    );

    // Check if proficiency channel doesn't already exist
    if (
      !server.channels.find(channel => channel.name === `ticket-${ticket.id}`)
    ) {
      // Create proficiency channel
      handler.createChannelTicketCommand(ticket.id, user);
    }
  }
}
