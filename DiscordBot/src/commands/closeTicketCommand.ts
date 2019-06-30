import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class CloseTicketCommand extends BaseCommand {

  readonly commandWords = ["close", "stop"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?closeTicket",
      description:
        "Use this command inside the ticket channel to close your ticket"
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
    // Get ticket channel id from channel name
    let ticketChannelId = (commandData.message.channel as Discord.TextChannel).name
      .toString()
      .replace("ticket", "")
      .toString();

    // Request API
    new ApiRequestHandler()

      // Request with type so in our .then method we'll have intellisense
      .requestAPIWithType<TicketReceive>(
        "GET",
        null,
        `https://api.dapperdino.co.uk/api/ticket/${ticketChannelId}`,
        commandData.config
      )

      // All went okay
      .then(ticketReceive => {
        // Get ticket channel creator
        let creatorId = ticketReceive.applicant.discordId;

        // Check if current user is creator
        if (commandData.message.author.id == creatorId) {
          // Delete discordMessage
          commandData.message.channel.delete();

          // Close ticket through API
          new ApiRequestHandler().requestAPI(
            "POST",
            null,
            `https://api.dapperdino.co.uk/api/ticket/${ticketChannelId}/close`,
            commandData.config
          );

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
        } else {
          // Delete discordMessage if it's not the creator
          commandData.message.delete(0);

          // Create embed that tells the creator to close the ticket
          let endTicketEmbed = new Discord.RichEmbed()
            .setTitle(
              `${
              commandData.message.author.username
              } thinks that this ticket can be closed now`
            )
            .setThumbnail(commandData.message.author.avatarURL)
            .setColor("#2dff2d")
            .setDescription(
              "If you agree that this ticket should be closed then please type the following command:\n__**?closeTicket**__"
            );

          // Send embed to ticket channel
          commandData.message.channel.send(endTicketEmbed);
        }
      });
  }
}
