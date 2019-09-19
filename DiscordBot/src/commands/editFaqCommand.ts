import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { ChannelHandler } from "../handlers/channelHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { DiscordUser } from "../models/discordUser";
import { TextChannel } from "discord.js";
import { TicketProficiencyDialogue } from "../dialogues/TicketProficiencyDialogue";
import { Ticket } from "../models/ticket/ticket";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";
import { TicketHelper } from "../helpers/ticketHelper";
import { RichEmbedReactionHandler } from "../genericRichEmbedReactionHandler";
import { FaqDialogue } from "../dialogues/faqDialogue";
import { Faq } from "../models/faq/faq";
import { FaqIdentifierDialogue } from "../dialogues/faqIdentifierDialogue";
import { Constants } from "../constants";

export default class EditTicketCommand extends BaseCommand {
  readonly commandWords = ["editfaq"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?editFaq",
      description: "Choose one of the FAQs to be edited."
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return channel.name === "dapper-team-commands";
  }

  public async process(commandData: CommandData): Promise<void> {
    let startupEmbed = new Discord.RichEmbed()
      .setColor(Constants.EmbedColors.YELLOW)
      .setTitle("All FAQs");

    new ApiRequestHandler()
      .requestAPIWithType<{ id: number; question: string; answer: string }[]>(
        "GET",
        null,
        "faq"
      )
      .then(async data => {
        let startIndex = 0;
        let perPage = 5;
        let endIndex = startIndex + perPage;
        let max = data.length;

        let sentEmbed = (await commandData.message.channel
          .send(startupEmbed)
          .catch(console.error)) as Discord.Message;

        let handler = new RichEmbedReactionHandler<FaqWithClickHandler>(
          startupEmbed,
          sentEmbed
        );

        handler.addCategory("faqs", new Map());

        handler.setCurrentCategory("faqs");

        handler.addEmoji("faqs", "◀", {
          clickHandler: async data => {
            startIndex = startIndex - perPage > 0 ? startIndex - perPage : 0;
            endIndex = startIndex + perPage;
            let embed = await show();
            return { category: "faqs", embed };
          }
        } as FaqWithClickHandler);

        handler.addEmoji("faqs", "▶", {
          clickHandler: async data => {
            startIndex =
              startIndex + perPage > max ? startIndex : startIndex + perPage;
            endIndex = startIndex + perPage;
            let embed = await show();

            return { category: "faqs", embed };
          }
        } as FaqWithClickHandler);

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
            let currentFAQ = data[i];
            // Get emoji for proficiency number ()
            let emoji = getEmojiForNumber(currentIndex);

            // Remove emoji click if exists
            handler.removeIfExistsEmoji("faqs", emoji);
            let steps = new FaqIdentifierDialogue();

            // Add emoji click for current proficiency
            handler.addEmoji("faqs", emoji, {
              clickHandler: async data => {
                // Get member from guild
                let member = commandData.client.guilds
                  .first()
                  .members.find(
                    member => member.id === commandData.message.author.id
                  );

                // Check if member exists in guild
                if (member == null) return;

                let identifierData = { faq: data.faq, identifier: "" };
                // START EDIT FAQ PROCESS
                let identifier: DialogueStep<any> = new DialogueStep<any>(
                  identifierData,
                  steps.identifyStep,
                  "Enter Identifier (Answer, Question):"
                );

                let identifierHandler = new DialogueHandler(
                  [identifier],
                  data.faq
                );

                identifierHandler
                  .getInput(
                    commandData.message.channel as Discord.TextChannel,
                    commandData.message.author
                  )
                  .then(async i => {
                    if (i.identifier.toLowerCase().includes("answ")) {
                      let dialogue = new FaqDialogue(
                        commandData.message.channel as Discord.TextChannel,
                        commandData.message.member,
                        commandData.client
                      );

                      let answerStep: DialogueStep<Faq> = new DialogueStep<Faq>(
                        data.faq,
                        dialogue.addAnswer,
                        "Enter Answer:",
                        "Answer Successful",
                        "Answer Unsuccessful"
                      );

                      let handler = new DialogueHandler([answerStep], data.faq);

                      await handler
                        .getInput(
                          commandData.message.channel as Discord.TextChannel,
                          commandData.message.author
                        )
                        .then(faq => {
                          data.faq.answer = faq.answer;
                        });
                    } else if (i.identifier.toLowerCase().includes("quest")) {
                      let dialogue = new FaqDialogue(
                        commandData.message.channel as Discord.TextChannel,
                        commandData.message.member,
                        commandData.client
                      );

                      let questionStep: DialogueStep<Faq> = new DialogueStep<
                        Faq
                      >(
                        data.faq,
                        dialogue.addQuestion,
                        "Enter Question:",
                        "Question Successful",
                        "Question Unsuccessful"
                      );

                      let handler = new DialogueHandler(
                        [questionStep],
                        data.faq
                      );

                      await handler
                        .getInput(
                          commandData.message.channel as Discord.TextChannel,
                          commandData.message.author
                        )
                        .then(faq => {
                          data.faq.question = faq.question;
                        });
                    }

                    new ApiRequestHandler().requestAPIWithType(
                      "POST",
                      identifierData.faq,
                      `faq?id=${identifierData.faq.id}`
                    );
                  });

                return { category: "faqs", embed };
              },
              faq: currentFAQ
            } as FaqWithClickHandler);

            // Add to embed
            embed.addField(`FAQ ${currentFAQ.id}`, currentFAQ.question);

            currentIndex++;
          }

          return embed;
        };

        handler.startCollecting(commandData.message.author.id);

        let embed = await show();
        await sentEmbed.react("◀");
        await sentEmbed.react("▶");
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

interface FaqWithClickHandler {
  clickHandler: (
    data: FaqWithClickHandler
  ) => Promise<{ embed: Discord.RichEmbed; category: string }>;
  faq: Faq;
}

interface FaqEditIdentifier {
  clickHandler: (
    data: FaqEditIdentifier
  ) => Promise<{ embed: Discord.RichEmbed; category: string }>;
  optionData: any;
}
