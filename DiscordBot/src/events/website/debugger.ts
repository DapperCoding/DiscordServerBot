import { GuildHelper } from "../../helpers/guildHelper";
import { TextChannel, Guild, RichEmbed } from "discord.js";
import TicketEmbed from "../../models/ticket/ticketEmbed";

export class DebuggerEvent {
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
      .setColor("#ff0000")
      .setTitle(`Hey ${info.ticket.applicant.username} - just a tip`)
      .setDescription(
        "We think you should use a debugging tool, you can find a video about how to use them just below."
      )
      .addField(
        "documentation:",
        "https://code.visualstudio.com/docs/nodejs/nodejs-debugging"
      )
      .addField("video:", "https://www.youtube.com/watch?v=2oFKNL7vYV8")
      .setFooter("Thanks in advance!");

    channel.send(endTicketEmbed);
  }
}
