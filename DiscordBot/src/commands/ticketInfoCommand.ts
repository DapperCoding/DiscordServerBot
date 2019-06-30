import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Ticket } from "../models/ticket/ticket";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class TicketInfoCommand extends BaseCommand {

  readonly commandWords = ["info"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?info in ticket channel",
      description: "Use this command in any ticket channel to get information."
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
    let curChannel = commandData.message.channel as Discord.TextChannel;
    let id = curChannel.name.toLowerCase().replace("ticket", "");

    new ApiRequestHandler(commandData.client, commandData.config)
      .requestAPIWithType<Ticket>(
        "GET",
        null,
        `https://api.dapperdino.co.uk/api/ticket/${id}`,
        commandData.config
      )
      .then(ticket => {
        // Add ticket info
        let ticketEmbed = new Discord.RichEmbed()
          .setTitle("Subject: " + ticket.subject + ".")
          .setColor("#ffdd05")
          .addField("Description:", ticket.description + ".")
          .setFooter("Thanks for all your help :)");

        curChannel.send(ticketEmbed);
      })
      .catch(err => console.error(err));
  }
}
