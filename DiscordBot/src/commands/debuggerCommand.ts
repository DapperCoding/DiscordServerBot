import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { Constants } from "../constants";

export default class DebuggerCommand extends BaseCommand {
  readonly commandWords = ["debugger"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?debugger @user",
      description: "Send information how to use a debugger in vscode",
      roles: ["teacher"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    // Return true because we should be able to send the embed in any channel
    return true;
  }

  public async process(commandData: CommandData): Promise<void> {
    let summoned = commandData.guild.member(
      commandData.message.mentions.users.first()
    );
    if (!summoned) {
      commandData.message.delete();
      return;
    }

    let debuggingEmbed = this.createDebuggerEmbed(
      summoned,
      commandData.message
    );

    commandData.message.channel.send(debuggingEmbed).then(newmsg => {
      commandData.message.delete(0);
    });
  }

  private createDebuggerEmbed(
    user: Discord.GuildMember,
    message: Discord.Message
  ): Discord.RichEmbed {
    return new Discord.RichEmbed()
      .setColor(Constants.EmbedColors.YELLOW)
      .setTitle(`Hey ${user.user.username} - just a tip`)
      .setDescription(
        "We think you should use a debugging tool, you can find a video about how to use them just below."
      )
      .addField(
        "documentation:",
        "https://code.visualstudio.com/docs/nodejs/nodejs-debugging"
      )
      .addField("video:", "https://www.youtube.com/watch?v=2oFKNL7vYV8")
      .setFooter("Thanks in advance!");
  }
}
