import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { XpHandler } from "../handlers/xpHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class LevelCommand extends BaseCommand {
  readonly commandWords = ["level"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?level",
      description: "Lets you know your level and exp in the server"
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public canUseCommand(roles: Discord.Role[]) {
    let helpObj: IBotCommandHelp = this.getHelp();
    let canUseCommand = true;

    if (helpObj.roles != null && helpObj.roles.length > 0) {
      canUseCommand = false;

      for (var cmdRole in helpObj.roles) {
        if (
          roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase())
        )
          canUseCommand = true;
      }
    }

    return canUseCommand;
  }

  public async process(commandData: CommandData): Promise<void> {
    this.createLevelEmbed(commandData.message).then(xpEmbed => {
      commandData.message.channel.send(xpEmbed).then(newMsg => {
        commandData.message.delete(0);
        (newMsg as Discord.Message).delete(5000);
      });
    });
  }

  private createLevelEmbed(message) {
    return new Promise<Discord.RichEmbed>(async (resolve, reject) => {
      new XpHandler().getLevelDataById(message.author.id).then(levelData => {
        let xpEmbed = new Discord.RichEmbed()
          .setTitle(message.author.username)
          .setColor("#ff00ff")
          .addField("Level", levelData.level, true)
          .addField("XP", levelData.xp, true);
        return resolve(xpEmbed);
      });
    });
  }
}
