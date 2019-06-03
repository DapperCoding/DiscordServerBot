import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import { getRandomInt } from "../utils";
import * as discord from "discord.js";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import {
  GenericRichEmbedReactionHandler,
  RichEmbedReactionHandler
} from "../genericRichEmbedReactionHandler";
import { ticket } from "../models/ticket/ticket";
import { channelhandler } from "../handlers/channelHandler";
import { ticketReceive } from "../models/ticket/ticketReceive";
import { compactDiscordUser } from "../models/compactDiscordUser";
import { Bot } from "../bot";

export default class BotInfoCommand implements IBotCommand {
  private bot: Bot | null = null;

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
  private readonly CMD_REGEXP = /^\?opentickets/im;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?opentickets",
      description: "Sends a list of all joinable tickets to your dms",
      roles: ["admin", "happy to help"]
    };
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public init(bot: IBot, dataPath: string): void {
    this.bot = bot as Bot;
  }

  public isValid(msg: string): boolean {
    return this.CMD_REGEXP.test(msg);
  }

  public async process(
    msg: string,
    answer: IBotMessage,
    message: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[]
  ): Promise<void> {
    let startupEmbed = new discord.RichEmbed()
      .setColor("#ff0000")
      .setTitle("All open tickets");

    new apiRequestHandler(client, config)

      // Set params for requestAPI
      .requestAPIWithType<
        { id: number; count: number; subject: string; description: string }[]
      >(
        "GET",
        null,
        `https://api.dapperdino.co.uk/api/ticket/opentickets`,
        config
      )

      // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
      .then(async tickets => {
        let startIndex = 0;
        let perPage = 5;
        let endIndex = startIndex + perPage;
        let max = tickets.length;

        let sentEmbed = (await message.channel
          .send(startupEmbed)
          .catch(console.error)) as discord.Message;
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
                      data.ticket.id
                    }/addAssignee`,
                    config
                  )

                  // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
                  .then(receivedTicketBody => {
                    if (!this.bot) {
                      return;
                    }
                    // Create new proficiency model
                    let receivedTicket: ticketReceive = JSON.parse(
                      JSON.stringify(receivedTicketBody)
                    ) as ticketReceive;

                    let acceptedTicketembed = new discord.RichEmbed()
                      .setTitle(
                        `${message.author.username} is here to help you!`
                      )
                      .setThumbnail(message.author.avatarURL)
                      .setColor("#2dff2d")
                      .setDescription(
                        "Please treat them nicely and they will treat you nicely back :)"
                      );

                    // Create new channel handler
                    new channelhandler(this.bot.getServer())

                      // Add h2h-er to proficiency channel
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
                        message.reply(
                          `Whoops, something went wrong. \n ${err}`
                        );
                      });
                  })
                  .catch(err => {
                    sent++;
                    if (sent == 1)
                      // Something went wrong, log error
                      message.reply(`Whoops, something went wrong. \n ${err}`);
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

        handler.startCollecting(message.author.id);

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
  ) => Promise<{ embed: discord.RichEmbed; category: string }>;
  ticket: { id: number; count: number; subject: string; description: string };
}
