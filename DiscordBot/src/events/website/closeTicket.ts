import TicketEmbed from "../../models/ticket/ticketEmbed";
import { RichEmbed, TextChannel, Guild } from "discord.js";
import { GuildHelper } from "../../helpers/guildHelper";

export class CloseTicketEvent {
  public static handle(info: TicketEmbed) {
    let information = info;
    let channel = GuildHelper.getChannelByName(
      `ticket${info.ticket.id}`
    ) as TextChannel;

    if (channel) {
      channel.delete("Closed through ticket portal (web)");
    }

    let completedTicketEmbed = new RichEmbed()
      .setTitle(`Ticket ${information.ticket.id} has been completed!`)
      .setColor("#ff0000")
      .setDescription(
        `${
          information.ticket.applicant.username
        }'s problem has now been resolved, good job`
      );

    // Get completed tickets channel
    let completedTicketsChannel = GuildHelper.getChannelByName(
      "completed-tickets"
    ) as TextChannel;

    if (!completedTicketsChannel) return "Channel not found";

    //Send the embed to completed tickets channel
    completedTicketsChannel.send(completedTicketEmbed);
  }
}
