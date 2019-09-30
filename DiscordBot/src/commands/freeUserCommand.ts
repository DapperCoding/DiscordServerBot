import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { Constants } from "../constants";

export default class FreeUserCommand extends BaseCommand {
  readonly commandWords = ["free"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?free",
      description: "Free a user (remove user permissions from current channel)",
      roles: ["teacher"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return channel.name.toLowerCase().startsWith("ticket");
  }

  public async process(commandData: CommandData): Promise<void> {
    // Get tagged user
    let freed = commandData.message.guild.member(
      commandData.message.mentions.users.first()
    );

    // Check if there's a member tagged, if not we remove the message and quit processing the command
    if (!freed) {
      commandData.message.delete();
      return;
    }

    // Remove permissions from channel
    this.freeUser(freed, commandData.message);

    // Create summoner embed
    let commandUserEmbed = this.createCommandUserEmbed(
      freed,
      commandData.message
    );

    // Create summoned embed
    let freedEmbed = this.createFreedUserEmbed(freed, commandData.message);

    // Send summoned embed to tagged user
    freed.send(freedEmbed).then(newmsg => {
      commandData.message.delete(0);
    });

    // Send summoner embed to command user
    commandData.message.member.send(commandUserEmbed).then(newmsg => {
      commandData.message.delete(0);
    });
  }

  private freeUser(user: Discord.GuildMember, message: Discord.Message) {
    // Add permissions to this channel for creator
    (message.channel as Discord.TextChannel).overwritePermissions(user, {
      READ_MESSAGE_HISTORY: false,
      SEND_MESSAGES: false,
      VIEW_CHANNEL: false,
      EMBED_LINKS: false
    });
  }

  private createCommandUserEmbed(
    user: Discord.GuildMember,
    message: Discord.Message
  ): Discord.RichEmbed {
    // Create embed for command user
    return new Discord.RichEmbed()
      .setColor(Constants.EmbedColors.GREEN)
      .setTitle(`You have freed ${user.displayName}`)
      .setDescription(`This is just a notification`)
      .setFooter("Have a great 2019!");
  }

  private createFreedUserEmbed(
    user: Discord.GuildMember,
    message: Discord.Message
  ): Discord.RichEmbed {
    // Create freed embed
    return new Discord.RichEmbed()
      .setColor(Constants.EmbedColors.GREEN)
      .setTitle(`You have been freed by ${message.author.username}`)
      .setDescription(
        `Please join the conversation over at #${
          (message.channel as Discord.TextChannel).name
        }`
      )
      .setFooter("Thanks in advance!");
  }
}
