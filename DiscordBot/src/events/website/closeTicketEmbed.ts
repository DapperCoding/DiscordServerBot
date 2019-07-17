import { GuildHelper } from "../../helpers/guildHelper";
import { Guild, TextChannel, RichEmbed } from "discord.js";
import TicketEmbed from "../../models/ticket/ticketEmbed";

export class CloseTicketEmbedEvent {
  public static handle(server: Guild, info: TicketEmbed) {
    let channel = GuildHelper.getChannelByName(
      `ticket${info.ticket.id}`
    ) as TextChannel;

    if (!channel) {
      return true;
    }

    let user = server.members.get(info.user.discordId);

    if (!user) {
      return true;
    }

    // Create embed that tells the creator to close the proficiency
    let endTicketEmbed = new RichEmbed()
      .setTitle(
        `${info.user.username} thinks that this ticket can be closed now`
      )
      .setThumbnail(user.user.avatarURL)
      .setColor("#2dff2d")
      .setDescription(
        "If you agree that this ticket should be closed then please type the following command:\n__**?closeTicket**__"
      );

    channel.send(endTicketEmbed);
  }
}
