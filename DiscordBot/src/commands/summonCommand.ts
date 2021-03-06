import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { Constants, RoleNames } from "../constants";

export default class SummonCommand extends BaseCommand {
  readonly commandWords = ["summon"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?summon",
      description: "Summon a user (give user permissions to current channel)",
      roles:[RoleNames.MODERATOR, RoleNames.DAPPER_CODING]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return channel.name.toLowerCase().startsWith("ticket");
  }

  public canUseCommand(roles: Discord.Role[]) {
    let helpObj: IBotCommandHelp = this.getHelp();
    let canUseCommand = true;

    if (helpObj.roles != null && helpObj.roles.length > 0) {
      canUseCommand = false;

      for (let i = 0; i < helpObj.roles.length; i++) {
        let cmdRole = helpObj.roles[i];
        if (
          roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase())
        )
          canUseCommand = true;
      }
    }

    return canUseCommand;
  }

  public async process(commandData: CommandData): Promise<void> {
    let summoned = commandData.message.guild.member(
      commandData.message.mentions.users.first()
    );
    if (!summoned) {
      commandData.message.delete();
      return;
    }
    this.summonUser(summoned, commandData.message);

    // Create summoner embed
    let summonerEmbed = this.createSummonerEmbed(summoned, commandData.message);

    // Create summoned embed
    let summonedEmbed = this.createSummonedEmbed(summoned, commandData.message);

    // Send summoned embed to tagged user
    summoned.send(summonedEmbed).then(newmsg => {
      commandData.message.delete(0);
    });

    // Send summoner embed to command user
    commandData.message.member.send(summonerEmbed).then(newmsg => {
      commandData.message.delete(0);
    });
  }

  private summonUser(user: Discord.GuildMember, message: Discord.Message) {
    // Add permissions to this channel for creator
    (message.channel as Discord.TextChannel).overwritePermissions(user, {
      VIEW_CHANNEL: true,
      READ_MESSAGES: true
    });
  }

  private createSummonerEmbed(
    user: Discord.GuildMember,
    message: Discord.Message
  ): Discord.RichEmbed {
    // Create embed for command user
    return new Discord.RichEmbed()
      .setColor(Constants.EmbedColors.GREEN)
      .setTitle(`You have summoned ${user.displayName}`)
      .setDescription(
        `Please join the conversation over at #${
          (message.channel as Discord.TextChannel).name
        }`
      )
      .setFooter("Thanks in advance!");
  }

  private createSummonedEmbed(
    user: Discord.GuildMember,
    message: Discord.Message
  ): Discord.RichEmbed {
    // Create embed for summoned user
    return new Discord.RichEmbed()
      .setColor(Constants.EmbedColors.GREEN)
      .setTitle(`You have been summoned by ${message.author.username}`)
      .setDescription(
        `Please join the conversation over at #${
          (message.channel as Discord.TextChannel).name
        }`
      )
      .setFooter("Have a great 2019!");
  }
}
