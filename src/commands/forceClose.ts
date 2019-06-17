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

export default class forceCloseTicketCommand implements IBotCommand {
  private readonly CMD_REGEXP = /^\?forceclose/im;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?forceClose",
      description:
        "Use this command inside the ticket channel to force close a ticket",
      roles: ["happy to help", "admin"]
    };
  }

  public init(bot: IBot, dataPath: string): void {}

  public isValid(msg: string): boolean {
    return this.CMD_REGEXP.test(msg.toLowerCase());
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return channel.name.toLowerCase().startsWith("ticket");
  }

  public canUseCommand(roles: discord.Role[]) {
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

    // Delete discordMessage
    message.channel.delete();

    // Close ticket through API
    new apiRequestHandler()
      .requestAPIWithType<ticketReceive>(
        "POST",
        null,
        `https://api.dapperdino.co.uk/api/ticket/${ticketChannelId}/close`,
        config
      )
      .then(ticketReceive => {
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
      });
  }
}
