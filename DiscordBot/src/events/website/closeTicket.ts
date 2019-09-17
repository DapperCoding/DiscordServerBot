import TicketEmbed from "../../models/ticket/ticketEmbed";
import { RichEmbed, TextChannel, Guild } from "discord.js";
import { GuildHelper } from "../../helpers/guildHelper";

export class CloseTicketEvent {
  public static handle(info: TicketEmbed) {
    let channel = GuildHelper.getChannelByName(
      `ticket${info.ticket.id}`
    ) as TextChannel;

    if (channel) {
      channel.delete("Closed through ticket portal (web)");
    }
  }
}
