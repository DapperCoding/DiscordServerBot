import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class ForceCloseTicketCommand extends BaseCommand {

  readonly commandWords = ["forceClose"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?forceClose",
      description:
        "Use this command inside the ticket channel to force close a ticket",
      roles: ["happy to help", "admin"]
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
    // Get ticket channel id from channel name
    let ticketChannelId = (commandData.message.channel as Discord.TextChannel).name
      .toString()
      .replace("ticket", "")
      .toString();

    // Delete discordMessage
    commandData.message.channel.delete();

    // Close ticket through API
    new ApiRequestHandler()
      .requestAPIWithType<TicketReceive>(
        "POST",
        null,
        `https://api.dapperdino.co.uk/api/ticket/${ticketChannelId}/close`,
        commandData.config
      )
      .then(ticketReceive => {
        // Get current guild
        let guild = commandData.message.guild;

        if (!guild) return "Server not found";

        //Create embed for helpers to know that the ticket is closed
        let completedTicketEmbed = new Discord.RichEmbed()
          .setTitle(`Ticket ${ticketChannelId} has been completed!`)
          .setColor("#ff0000")
          .setDescription(
            `${
            ticketReceive.applicant.username
            }'s problem has now been resolved, good job`
          );

        // Get completed tickets channel
        let completedTicketsChannel = guild.channels.find(
          channel => channel.name === "completed-tickets"
        ) as Discord.TextChannel;

        if (!completedTicketsChannel) return "Channel not found";

        //Send the embed to completed tickets channel
        completedTicketsChannel.send(completedTicketEmbed);
      });
  }
}
