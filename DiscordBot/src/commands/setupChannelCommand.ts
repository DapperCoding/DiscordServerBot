import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Ticket } from "../models/ticket/ticket";
import { TicketCreatedEvent } from "../events/shared/ticketCreated";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { TicketHelper } from "../helpers/ticketHelper";

export default class MirrorCommand extends BaseCommand {
  readonly commandWords = ["setupChannel"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?setupChannel",
      description: "Setup the current ticket channel.",
      roles: ["admin", "happy to help", "dappercoding"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return channel.name.toLowerCase().startsWith("ticket");
  }

  public async process(commandData: CommandData): Promise<void> {
    // Channel
    let channel = commandData.message.channel as Discord.TextChannel;

    // Request ticket by id
    new ApiRequestHandler()
      .requestAPIWithType<Ticket>(
        "GET",
        null,
        `ticket/${channel.name.toLowerCase().replace("ticket", "")}`
      )
      .then(ticket => {
        // Get member that created the ticket
        let member = commandData.guild.members.get(
          ticket.applicant.discordId
        ) as Discord.GuildMember;

        // Update topic
        TicketHelper.updateTopic(member, ticket);
        TicketHelper.fixPermissions(commandData.guild, ticket);
      });
  }
}
