import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Ticket } from "../models/ticket/ticket";
import { TicketCreatedEvent } from "../events/shared/ticketCreated";
import { TicketReceive } from "../models/ticket/ticketReceive";

export default class MirrorCommand extends BaseCommand {
  readonly commandWords = ["syncTickets"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?syncTickets",
      description: "Sync the open & closed ticket channels",
      roles: ["admin", "happy to help", "dappercoding"]
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
        // Open the channel if not created
        this.openOpenTickets(tickets, commandData);

        // Delete the channel if created but not in the list
        this.deleteClosedTickets(tickets, commandData);
      });
  }

  private async openOpenTickets(
    tickets: {
      id: number;
      count: number;
      subject: string;
      description: string;
    }[],
    commandData: CommandData
  ) {
    tickets.forEach(openTicket => {
      if (
        commandData.guild.channels.find(
          x => x.name.toLowerCase() === `ticket${openTicket.id}`
        )
      )
        return;
      new ApiRequestHandler()

        // Request with type so in our .then method we'll have intellisense
        .requestAPIWithType<TicketReceive>(
          "GET",
          null,
          `/ticket/${openTicket.id}`
        )
        .then(ticket => {
          TicketCreatedEvent.handle(ticket, commandData.message.guild);
        });
    });
    console.log("Finished syncing tickets (OPEN)");
  }

  private async deleteClosedTickets(
    tickets: {
      id: number;
      count: number;
      subject: string;
      description: string;
    }[],
    commandData: CommandData
  ) {
    let ids = tickets.map(x => x.id);
    commandData.guild.channels
      .filter(
        x =>
          x.name.toLowerCase().startsWith("ticket") &&
          !["tickets", "tickets-in-progress", "tickets-to-accept"].includes(
            x.name.toLowerCase()
          )
      )
      .map(x => x.name.replace("ticket", ""))
      .forEach(x => {
        let id = parseInt(x);
        if (!ids.includes(id)) {
          // Delete channel
          let channel = commandData.guild.channels.find(
            x => x.name.toLowerCase() === `ticket${id}`
          );
          if (channel.deletable)
            channel.delete("Closed closed ticket channel (SYNC)");
        }
      });
    console.log("Finished syncing tickets (CLOSE)");
  }
}
