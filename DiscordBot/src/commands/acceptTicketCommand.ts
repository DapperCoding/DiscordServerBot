import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { ChannelHandler } from "../handlers/channelHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { DiscordUser } from "../models/discordUser";

export default class AcceptTicketCommand extends BaseCommand {
  readonly commandWords = ["acceptticket"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?acceptTicket",
      description:
        "For happy to help-ers to get access to the ticket channel on discord",
      roles: ["happy to help", "admin"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return channel.name.toLowerCase() === "h2h-admin-commands";
  }

  public async process(commandData: CommandData): Promise<void> {
    // Get member from guild
    let member = commandData.client.guilds
      .first()
      .members.find(member => member.id === commandData.message.author.id);

    // Check if member exists in guild
    if (member == null) return;

    // Create new compactDiscordUser that's sent to the API
    let user: DiscordUser = new DiscordUser();

    // Fill properties
    user.discordId = commandData.message.author.id;
    user.username = commandData.message.author.username;
    let sent = 0;
    // Post request to /api/Ticket/{ticketId}/AddAssignee to add current user to db as Assignee
    new ApiRequestHandler(commandData.client)

      // Set params for requestAPI
      .requestAPI(
        "POST",
        user,
        `ticket/${commandData.message.content.split(" ")[1]}/addAssignee`
      )

      // When everything went right, we receive a ticket back, so we add the h2h-er to the ticket channel
      .then(receivedTicketBody => {
        // Create new ticket model
        let receivedTicket: TicketReceive = JSON.parse(
          JSON.stringify(receivedTicketBody)
        ) as TicketReceive;

        let acceptedTicketembed = new Discord.RichEmbed()
          .setTitle(
            `${commandData.message.author.username} is here to help you!`
          )
          .setThumbnail(commandData.message.author.avatarURL)
          .setColor("#2dff2d")
          .setDescription(
            "Please treat them nicely and they will treat you nicely back :)"
          );

        // Create new channel handler
        new ChannelHandler(commandData.guild)

          // Add h2h-er to ticket channel
          .addPermissionsToChannelTicketCommand(
            receivedTicket.id,
            commandData.message,
            acceptedTicketembed
          )

          // If everything went okay, we finally send the message
          .then(() => {
            //Delete the accept message to keep the channel clean
            commandData.message.delete(0);
          })

          .catch(err => {
            // Something went wrong, log error
            commandData.message.reply(
              `Whoops, something went wrong. \n ${err}`
            );
          });
      })
      .catch(err => {
        sent++;
        if (sent == 1)
          // Something went wrong, log error
          commandData.message.reply(`Whoops, something went wrong. \n ${err}`);
      });
  }
}
