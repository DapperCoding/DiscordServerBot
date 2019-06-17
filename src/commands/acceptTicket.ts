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
import BaseCommand from "../baseCommand";

export default class acceptTicketCommand extends BaseCommand {
  constructor() {
    super(/^\?acceptticket/im);
  }

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?acceptTicket",
      description:
        "For happy to help-ers to get access to the ticket channel on discord",
      roles: ["happy to help", "admin"]
    };
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return channel.name.toLowerCase() === "h2h-admin-commands";
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
    // Get member from guild
    let member = client.guilds
      .first()
      .members.find(member => member.id === message.author.id);

    // Check if member exists in guild
    if (member == null) return;

    // Create new compactDiscordUser that's sent to the API
    let user: compactDiscordUser = new compactDiscordUser();

    // Fill properties
    user.discordId = message.author.id;
    user.username = message.author.username;
    let sent = 0;
    // Post request to /api/Ticket/{ticketId}/AddAssignee to add current user to db as Assignee
    new apiRequestHandler(client, config)

      // Set params for requestAPI
      .requestAPI(
        "POST",
        user,
        `https://api.dapperdino.co.uk/api/ticket/${
          messageContent.split(" ")[1]
        }/addAssignee`,
        config
      )

      // When everything went right, we receive a ticket back, so we add the h2h-er to the ticket channel
      .then(receivedTicketBody => {
        // Create new ticket model
        let receivedTicket: ticketReceive = JSON.parse(
          JSON.stringify(receivedTicketBody)
        ) as ticketReceive;

        let acceptedTicketembed = new discord.RichEmbed()
          .setTitle(`${message.author.username} is here to help you!`)
          .setThumbnail(message.author.avatarURL)
          .setColor("#2dff2d")
          .setDescription(
            "Please treat them nicely and they will treat you nicely back :)"
          );

        // Create new channel handler
        new channelhandler(guild)

          // Add h2h-er to ticket channel
          .addPermissionsToChannelTicketCommand(
            receivedTicket.id,
            message,
            acceptedTicketembed
          )

          // If everything went okay, we finally send the message
          .then(() => {
            //Delete the accept message to keep the channel clean
            message.delete(0);
          })

          .catch(err => {
            // Something went wrong, log error
            message.reply(`Whoops, something went wrong. \n ${err}`);
          });
      })
      .catch(err => {
        sent++;
        if (sent == 1)
          // Something went wrong, log error
          message.reply(`Whoops, something went wrong. \n ${err}`);
      });
  }
}
