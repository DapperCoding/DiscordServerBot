import { ApiRequestHandler } from "../../handlers/apiRequestHandler";
import { Message } from "../../models/message";
import { TicketReaction } from "../../models/ticket/ticketReaction";
import { TextChannel, Guild, RichEmbed, Client } from "discord.js";

export class AddTicketReactionEvent {
  public static handle(server: Guild, bot: Client, unsentTicketReaction: any) {
    // Get proficiency channel
    let channel = server.channels.find(
      c => c.name == `ticket${unsentTicketReaction.ticketId}`
    ) as TextChannel;

    if (!channel) return true;

    let fromUser = server.members.get(unsentTicketReaction.discordId);

    if (!fromUser) return true;

    let reactionEmbed = new RichEmbed()
      .setTitle(`Message from ${fromUser.user.username}`)
      .setDescription(unsentTicketReaction.message)
      .setThumbnail(
        fromUser.user.avatarURL ? fromUser.user.avatarURL : bot.user.avatarURL
      );

    // Send message if exists
    channel.send(reactionEmbed).then(msg => {
      let reaction = new TicketReaction();

      // Yikes fix
      if (Array.isArray(msg)) {
        msg = msg[0];
      }

      // Fill proficiency reaction model
      reaction.ticketId = unsentTicketReaction.ticketId;
      reaction.fromId = unsentTicketReaction.discordId; // use info from unsent
      reaction.username = unsentTicketReaction.username; // use info from unsent

      reaction.discordMessage = new Message();

      reaction.discordMessage.message = unsentTicketReaction.message;
      reaction.discordMessage.messageId = msg.id;
      reaction.discordMessage.timestamp = new Date(msg.createdTimestamp);
      reaction.discordMessage.guildId = msg.guild.id;
      reaction.discordMessage.channelId = msg.channel.id;
      reaction.discordMessage.isEmbed = false;
      reaction.discordMessage.isDm = false;

      // Request API and add our reaction to the database.
      new ApiRequestHandler()
        .requestAPIWithType<any>("POST", reaction, "/ticket/reaction")
        .then(console.log)
        .catch(console.error);
    });
  }
}
