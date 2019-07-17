import { RichEmbed, TextChannel, Guild, Client } from "discord.js";
import { GuildHelper } from "../../helpers/guildHelper";
import TicketEmbed from "../../models/ticket/ticketEmbed";

export class SendErrorEvent {
  public static handle(server: Guild, serverBot: Client, info: TicketEmbed) {
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

    let applicant = server.members.get(info.ticket.applicant.discordId);

    if (!applicant) {
      return true;
    }

    // Create embed that tells the creator to send their errors
    let errorEmbed = new RichEmbed()
      .setColor("#ff0000")
      .setTitle(`Please send us your errors`)
      .setDescription(`${user.user.username} asks you to send your errors`)
      .addField(
        "Screenshot",
        "Please send us a screenshot of your error too",
        false
      )
      .addField("Notification", `${applicant.user}`, false)
      .setFooter("Thanks in advance!");

    errorEmbed.setThumbnail(
      user.user.avatarURL ? user.user.avatarURL : serverBot.user.avatarURL
    );

    channel.send(errorEmbed);
  }
}
