import { Guild, Client, TextChannel, RichEmbed } from "discord.js";
import TicketEmbed from "../../models/ticket/ticketEmbed";
import { GuildHelper } from "../../helpers/guildHelper";

export class CodeEvent {
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
      .setColor("#00ff00")
      .setTitle(`Please send us your code`)
      .setDescription(`${user.user.username} asks you to send your code`)
      .addField(
        "As text",
        "Please send your code using codeblocks or sites like hastebin.",
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
