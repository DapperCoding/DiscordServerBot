import * as Discord from "discord.js";
import { IBot, IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { RichEmbedReactionHandler } from "../genericRichEmbedReactionHandler";
import { ChannelHandler } from "../handlers/channelHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { Bot } from "../bot";
import { CommandData } from "../models/commandData";
import BaseCommand from "../baseCommand";
import { ArchitectForm } from "../models/forms/forms";

export default class OpenApplicationsCommand extends BaseCommand {
  readonly commandWords = ["openarchitectapplications", "oaa"];
  readonly reactionHandlerType = "applications";
  private bot: Bot | null = null;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?openApplications",
      description: "Sends a list of all joinable applications to your dms",
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
      .setTitle("All Open Applications")
      .setFooter("Please respond to these ASAP");

    new ApiRequestHandler(commandData.client)
      .requestAPIWithType<ArchitectForm[]>(
        "GET",
        null,
        `/forms/architect/OpenInPerspective/${commandData.message.author.id}`
      )

      // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
      .then(async applications => {
        applications = applications.filter(
          a => a.discordUser.discordId !== commandData.message.author.id
        );

        let startIndex = 0;
        let perPage = 5;
        let endIndex = startIndex + perPage;
        let max = applications.length;

        let sentEmbed = (await commandData.message.channel
          .send(startupEmbed)
          .catch(console.error)) as Discord.Message;

        let handler = new RichEmbedReactionHandler<OpenApplication>(
          startupEmbed,
          sentEmbed
        );

        handler.addCategory("applications", new Map());

        handler.setCurrentCategory("applications");

        handler.addEmoji("applications", "◀", {
          clickHandler: async data => {
            startIndex = startIndex - perPage > 0 ? startIndex - perPage : 0;
            endIndex = startIndex + perPage;
            let embed = await show();
            return { category: "applications", embed };
          }
        } as OpenApplication);

        handler.addEmoji("applications", "▶", {
          clickHandler: async data => {
            startIndex =
              startIndex + perPage > max ? startIndex : startIndex + perPage;
            endIndex = startIndex + perPage;
            let embed = await show();

            return { category: "applications", embed };
          }
        } as OpenApplication);

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
            let currentApplication = applications[i];
            // Get emoji for proficiency number ()
            let emoji = getEmojiForNumber(currentIndex);

            // Remove emoji click if exists
            handler.removeIfExistsEmoji("applications", emoji);

            // Add emoji click for current proficiency
            handler.addEmoji("applications", emoji, {
              clickHandler: async data => {
                // Get member from guild
                let sent = 0;
                // Post request to /ticket/{ticketId}/AddAssignee to add current user to db as Assignee
                new ApiRequestHandler(commandData.client)

                  // Set params for requestAPI
                  .requestAPIWithType<any>(
                    "POST",
                    { reason: "Want to interview the person" },
                    `/forms/teacher/${data.application.id}/interview/${commandData.message.author.id}`
                  )

                  // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
                  .then(received => {
                    let applicant = commandData.guild.members.get(
                      currentApplication.discordUser.discordId
                    ) as Discord.GuildMember;
                    if (applicant == null) {
                      new ApiRequestHandler(commandData.client)

                        // Set params for requestAPI
                        .requestAPIWithType<any>(
                          "POST",
                          { reason: "Applicant left the server" },
                          `/forms/architect/${data.application.id}/reject/${commandData.message.author.id}`
                        );
                      commandData.message.channel.send(
                        `The applicant for form ${data.application.id} has left the server`
                      );
                      return;
                    }
                    try {
                      applicant.send(
                        `Congratulations! A member of the Dapper Recruiting team has requested an interview with you. Go to the channel: architect-${data.application.id} to start the interview.`
                      );
                    } catch (e) {}

                    const channelHandler = new ChannelHandler(
                      commandData.message.guild
                    );
                    channelHandler.createChannelForInterview(
                      "architect",
                      data.application.id,
                      applicant,
                      commandData.message.member
                    );
                  })
                  .catch(err => {
                    sent++;
                    if (sent == 1)
                      // Something went wrong, log error
                      commandData.message.reply(
                        `Whoops, something went wrong. \n ${err}`
                      );
                  });

                return { category: "applications", embed };
              },
              application: currentApplication
            } as OpenApplication);

            // Add to embed
            embed.addField(
              `Teacher Application #${currentApplication.id}`,
              `For: ${currentApplication.age}`
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

interface OpenApplication {
  clickHandler: (
    data: OpenApplication
  ) => Promise<{ embed: Discord.RichEmbed; category: string }>;
  application: ArchitectForm;
}
