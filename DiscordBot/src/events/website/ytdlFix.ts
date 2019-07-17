import { RichEmbed, TextChannel, Guild } from "discord.js";
import { GuildHelper } from "../../helpers/guildHelper";
import TicketEmbed from "../../models/ticket/ticketEmbed";

export class YtdlFixEvent {
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
    let url = "https://dapperdino.co.uk/ytdl-fix.zip";

    // Create embed that tells the creator to close the proficiency
    let ytdlfixEmbed = new RichEmbed()
      .setColor("#ff0000")
      .setTitle("The YTDL Fix")
      .setURL(url)
      .addField(
        "Please download the zip file " + info.ticket.applicant.username + ".",
        info.user.username +
          " asks you to download the zip file and extract the files to your node_modules folder (overwrite files)."
      )
      .addField(
        "Video explanation:",
        "https://www.youtube.com/watch?v=MsMYrxyYNZc"
      )
      .setFooter(
        "If you keep experiencing errors, feel free to ask your question in a ticket."
      );

    channel.send(ytdlfixEmbed);
    return true;
  }
}
