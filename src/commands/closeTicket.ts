import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import * as discord from "discord.js";
import { compactDiscordUser } from "../models/compactDiscordUser";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import { ticket } from "../models/ticket/ticket";
import { ticketReceive } from "../models/ticket/ticketReceive";
import { channelhandler } from "../handlers/channelHandler";
import { websiteBotService } from "../services/websiteBotService";

export default class acceptTicketCommand implements IBotCommand {
  private readonly CMD_REGEXP = /^\?close/im;
  private readonly CMD_REGEXP2 = /^\?stop/im;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?closeTicket",
      description:
        "Use this command inside the ticket channel to close your ticket"
    };
  }

  public init(bot: IBot, dataPath: string): void {}

  public isValid(msg: string): boolean {
    let b = this.CMD_REGEXP.test(msg.toLowerCase());

    if (!b) b = this.CMD_REGEXP2.test(msg.toLowerCase());

    return b;
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return channel.name.toLowerCase().startsWith("ticket");
  }

  public canUseCommand(roles: discord.Role[]) {
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

  public async process(
    messageContent: string,
    answer: IBotMessage,
    message: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[],
    wbs: websiteBotService,
    guild: discord.Guild
  ): Promise<void> {
    // Get ticket channel id from channel name
    let ticketChannelId = (message.channel as discord.TextChannel).name
      .toString()
      .replace("ticket", "")
      .toString();

    // Request API
    new apiRequestHandler()

      // Request with type so in our .then method we'll have intellisense
      .requestAPIWithType<ticketReceive>(
        "GET",
        null,
        `https://api.dapperdino.co.uk/api/ticket/${ticketChannelId}`,
        config
      )

      // All went okay
      .then(ticketReceive => {
        // Get ticket channel creator
        let creatorId = ticketReceive.applicant.discordId;

        // Check if current user is creator
        if (message.author.id == creatorId) {
          // Delete discordMessage
          message.channel.delete();

          // Close ticket through API
          new apiRequestHandler().requestAPI(
            "POST",
            null,
            `https://api.dapperdino.co.uk/api/ticket/${ticketChannelId}/close`,
            config
          );

          // Get current guild
          let guild = message.guild;

          if (!guild) return "Server not found";

          //Create embed for helpers to know that the ticket is closed
          let completedTicketEmbed = new discord.RichEmbed()
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
          ) as discord.TextChannel;

          if (!completedTicketsChannel) return "Channel not found";

          //Send the embed to completed tickets channel
          completedTicketsChannel.send(completedTicketEmbed);
        } else {
          // Delete discordMessage if it's not the creator
          message.delete(0);

          // Create embed that tells the creator to close the ticket
          let endTicketEmbed = new discord.RichEmbed()
            .setTitle(
              `${
                message.author.username
              } thinks that this ticket can be closed now`
            )
            .setThumbnail(message.author.avatarURL)
            .setColor("#2dff2d")
            .setDescription(
              "If you agree that this ticket should be closed then please type the following command:\n__**?closeTicket**__"
            );

          // Send embed to ticket channel
          message.channel.send(endTicketEmbed);
        }
      });
  }
}
