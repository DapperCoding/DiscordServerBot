import { GuildMember, TextChannel } from "discord.js";
import { Ticket } from "../models/ticket/ticket";

export class TicketHelper {
  public static updateTopic(member: GuildMember, ticket: Ticket) {
    // Find channel
    let channel = member.guild.channels.find(
      c => c.name.toLowerCase() === `ticket${ticket.id}`
    ) as TextChannel;

    // Do nothing if we can't find the channel
    if (!channel) {
      return;
    }

    // Set topic
    channel.setTopic(
      `This ticket is created by ${member.user.username} \n\n\n Subject:\n${
        ticket.subject
      } \n\n Description:\n${ticket.description} \n\n Framework:\n ${
        ticket.framework.name
      } \n\n Language: \n ${ticket.language.name}`
    );
  }
}
