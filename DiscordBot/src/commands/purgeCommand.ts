import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class PurgeCommand extends BaseCommand {
  readonly commandWords = ["purge"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?purge",
      description: "Bulk delete a number of messages from the channel",
      roles: ["dapper coding", "moderator"]
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

      for (var i = 0; i < helpObj.roles.length; i++) {
        var cmdRole = helpObj.roles[i];
        if (
          roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase())
        )
          canUseCommand = true;
      }
    }

    return canUseCommand;
  }

  public async process(commandData: CommandData): Promise<void> {
    commandData.message.delete(0);
    if (!commandData.message.member.hasPermission("MANAGE_MESSAGES")) {
      return;
    }
    let words = commandData.message.content.split(" ");
    let amount = parseInt(words.slice(1).join(" "));
    if (isNaN(amount)) {
      return;
    }
    commandData.message.channel
      .bulkDelete(amount)
      .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
      .catch(console.error);
  }
}
