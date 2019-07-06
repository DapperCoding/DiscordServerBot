import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class CountTicketsCommand extends BaseCommand {
  readonly commandWords = ["counttickets"];

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

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?countTickets",
      description:
        "Sends an embed in the current channel with the open ticket count",
      roles: ["admin", "happy to help"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public async process(commandData: CommandData): Promise<void> {
    new ApiRequestHandler(commandData.client)

      // Set params for requestAPI
      .requestAPIWithType<
        { id: number; count: number; subject: string; description: string }[]
      >("GET", null, `/ticket/opentickets`)

      // When everything went right, we receive a ticket back, so we add the h2h-er to the ticket channel
      .then(tickets => {
        let embed = new Discord.RichEmbed()
          .setColor("#ff0000")
          .setTitle(`There's currently ${tickets.length} open tickets`);

        commandData.message.channel.send(embed);
      });
  }
}
