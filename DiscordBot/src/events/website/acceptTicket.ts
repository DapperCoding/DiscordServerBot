import { RichEmbed, TextChannel, Guild } from "discord.js";
import { GuildHelper } from "../../helpers/guildHelper";
import TicketEmbed from "../../models/ticket/ticketEmbed";

export class AcceptTicketEvent {
  public static handle(server: Guild, info: TicketEmbed) {
    // console.log(info);
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

    // Add premissions to channel for h2h-er
    channel.overwritePermissions(user, {
      READ_MESSAGE_HISTORY: true,
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
      EMBED_LINKS: true
    });

    let acceptedTicketembed = new RichEmbed()
      .setTitle(`${info.user.username} is here to help you!`)
      .setThumbnail(user.user.avatarURL)
      .setColor("#2dff2d")
      .setDescription(
        "Please treat them nicely and they will treat you nicely back :)"
      );

    (channel as TextChannel).send(acceptedTicketembed);

    //Create embed for helpers to know that the proficiency is closed
    let inProgressEmbed = new RichEmbed()
      .setTitle(
        `Ticket ${info.ticket.id} has been accepted by ${user.displayName}!`
      )
      .setColor("#ffdd05")
      .setDescription(`Thank you for your time and efforts :)`);

    //If the user has a profile pic we will set it in the embed
    if (user.user.avatarURL != null) {
      inProgressEmbed.setThumbnail(user.user.avatarURL);
    }

    // Get completed tickets channel
    let inProgressChannel = server.channels.find(
      channel => channel.name === "tickets-in-progress"
    ) as TextChannel;

    if (!inProgressChannel) return "Channel not found";

    //Send the embed to completed tickets channel
    inProgressChannel.send(inProgressEmbed);
  }
}
