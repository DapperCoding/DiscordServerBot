import * as Discord from "discord.js";
import { IBot, IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { RichEmbedReactionHandler } from "../genericRichEmbedReactionHandler";
import { ChannelHandler } from "../handlers/channelHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { Bot } from "../bot";
import { CommandData } from "../models/commandData";
import BaseCommand from "../baseCommand";
import { DiscordUser } from "../models/discordUser";

export default class OpenTicketsCommand extends BaseCommand {
  readonly commandWords = ["opentickets"];

  private bot: Bot | null = null;

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
      caption: "?opentickets",
      description: "Sends a list of all joinable tickets to your dms",
      roles: ["admin", "happy to help"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public init(bot: IBot, dataPath: string): void {
    this.bot = bot as Bot;
  }

  public async process(commandData: CommandData): Promise<void> {
    let startupEmbed = new Discord.RichEmbed()
      .setColor("#ff0000")
      .setTitle("All open tickets");

    new ApiRequestHandler(commandData.client)

      // Set params for requestAPI
      .requestAPIWithType<
        { id: number; count: number; subject: string; description: string }[]
      >("GET", null, `/ticket/opentickets`)

      // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
      .then(async tickets => {
        let startIndex = 0;
        let perPage = 5;
        let endIndex = startIndex + perPage;
        let max = tickets.length;

        let sentEmbed = (await commandData.message.channel
          .send(startupEmbed)
          .catch(console.error)) as Discord.Message;
        let handler = new RichEmbedReactionHandler<OpenTicket>(
          startupEmbed,
          sentEmbed
        );

        handler.addCategory("tickets", new Map());

        handler.setCurrentCategory("tickets");

        handler.addEmoji("tickets", "◀", {
          clickHandler: async data => {
            startIndex = startIndex - perPage > 0 ? startIndex - perPage : 0;
            endIndex = startIndex + perPage;
            let embed = await show();
            return { category: "tickets", embed };
          }
        } as OpenTicket);

        handler.addEmoji("tickets", "▶", {
          clickHandler: async data => {
            startIndex =
              startIndex + perPage > max ? startIndex : startIndex + perPage;
            endIndex = startIndex + perPage;
            let embed = await show();

            return { category: "tickets", embed };
          }
        } as OpenTicket);

        let sendEmojis = async () => {
          let currentIndex = 0;
          for (
            let i = startIndex;
            i < endIndex && i < max && currentIndex < perPage;
            i++
          ) {
            // Get emoji for proficiency number ()
            let emoji = getEmojiForNumber(currentIndex);
            await sentEmbed.react(emoji);
            currentIndex++;
          }
        };

        let show = async () => {
          let embed = handler.getEmbed();
          embed.fields = [];
          let currentIndex = 0;
          sendEmojis();
          for (let i = startIndex; i < endIndex && i < max; i++) {
            // Get current proficiency
            let currentTicket = tickets[i];
            // Get emoji for proficiency number ()
            let emoji = getEmojiForNumber(currentIndex);

            // Remove emoji click if exists
            handler.removeIfExistsEmoji("tickets", emoji);

            // Add emoji click for current proficiency
            handler.addEmoji("tickets", emoji, {
              clickHandler: async data => {
                // Get member from guild
                let member = commandData.client.guilds
                  .first()
                  .members.find(
                    member => member.id === commandData.message.author.id
                  );

                // Check if member exists in guild
                if (member == null) return;

                // Create new DiscordUser that's sent to the API
                let user: DiscordUser = new DiscordUser();

                // Fill properties
                user.discordId = commandData.message.author.id;
                user.username = commandData.message.author.username;
                let sent = 0;
                // Post request to /ticket/{ticketId}/AddAssignee to add current user to db as Assignee
                new ApiRequestHandler(commandData.client)

                  // Set params for requestAPI
                  .requestAPI(
                    "POST",
                    user,
                    `/ticket/${data.ticket.id}/addAssignee`
                  )

                  // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
                  .then(receivedTicketBody => {
                    if (!this.bot) {
                      return;
                    }
                    // Create new proficiency model
                    let receivedTicket: TicketReceive = JSON.parse(
                      JSON.stringify(receivedTicketBody)
                    ) as TicketReceive;

                    let acceptedTicketembed = new Discord.RichEmbed()
                      .setTitle(
                        `${
                          commandData.message.author.username
                        } is here to help you!`
                      )
                      .setThumbnail(commandData.message.author.avatarURL)
                      .setColor("#2dff2d")
                      .setDescription(
                        "Please treat them nicely and they will treat you nicely back :)"
                      );

                    // Create new channel handler
                    new ChannelHandler(commandData.guild)

                      // Add h2h-er to proficiency channel
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
                      commandData.message.reply(
                        `Whoops, something went wrong. \n ${err}`
                      );
                  });

                return { category: "tickets", embed };
              },
              ticket: currentTicket
            } as OpenTicket);

            // Add to embed
            embed.addField(
              `Ticket${currentTicket.id} (${
                currentTicket.count
              } team member(s) helping)`,
              currentTicket.subject +
                "\n https://dapperdino.co.uk/HappyToHelp/Ticket?id=" +
                currentTicket.id
            );

            currentIndex++;
          }

          return embed;
        };

        handler.startCollecting(commandData.message.author.id);

        let embed = await show();

        sentEmbed.edit(embed);
      });
    var reaction_numbers = [
      "\u0031\u20E3",
      "\u0032\u20E3",
      "\u0033\u20E3",
      "\u0034\u20E3",
      "\u0035\u20E3",
      "\u0036\u20E3",
      "\u0037\u20E3",
      "\u0038\u20E3",
      "\u0039\u20E3"
    ];
    let getEmojiForNumber = (i: number) => {
      return reaction_numbers[i];
    };
  }
}

interface OpenTicket {
  clickHandler: (
    data: OpenTicket
  ) => Promise<{ embed: Discord.RichEmbed; category: string }>;
  ticket: { id: number; count: number; subject: string; description: string };
}
