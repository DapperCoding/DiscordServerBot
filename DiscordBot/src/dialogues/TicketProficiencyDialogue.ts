import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Message, RichEmbed, Client, TextChannel, DMChannel } from "discord.js";
import { RichEmbedReactionHandler } from "../genericRichEmbedReactionHandler";
import { Proficiency } from "../models/proficiency/proficiency";
import { IBotConfig } from "../api";

export class TicketProficiencyDialogue {
  /**
   * test
   */
  public SelectLanguage(
    client: Client,
    channel: TextChannel | DMChannel,
    authorId: string
  ) {
    return new Promise<Proficiency>((resolve, reject) => {
      let startupEmbed = new RichEmbed().setTitle("Choose the language");

      new ApiRequestHandler(client)

        // Set params for requestAPI
        .requestAPIWithType<Proficiency[]>(
          "GET",
          null,
          `/proficiency/getlanguages`
        )

        // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
        .then(async proficiencies => {
          let startIndex = 0;
          let perPage = 5;
          let endIndex = startIndex + perPage;
          let max = proficiencies.length;

          let sentEmbed = (await channel
            .send(startupEmbed)
            .catch(console.error)) as Message;
          let handler = new RichEmbedReactionHandler<TicketLangueWithHandler>(
            startupEmbed,
            sentEmbed
          );

          handler.addCategory("tickets", new Map());

          handler.setCurrentCategory("tickets");

          let sendEmojis = async () => {
            let currentIndex = 0;
            if (max > 10) {
              max = 10;
            }
            for (let i = 0; i < max; i++) {
              // Get emoji for proficiency number ()
              let emoji = getEmojiForNumber(currentIndex);
              await sentEmbed.react(emoji);
              currentIndex++;
            }
          };

          let embed = new RichEmbed().setTitle("Choose the language");
          let currentIndex = 0;
          sendEmojis();
          for (let i = 0; i < max; i++) {
            // Get current proficiency
            let currentProficiency = proficiencies[i];
            // Get emoji for proficiency number ()
            let emoji = getEmojiForNumber(currentIndex);

            // Remove emoji click if exists
            handler.removeIfExistsEmoji("tickets", emoji);

            // Add emoji click for current proficiency
            handler.addEmoji("tickets", emoji, {
              clickHandler: async data => {
                // resolve with chosen language
                resolve(data.proficiency);

                return {};
              },
              proficiency: currentProficiency
            } as TicketLangueWithHandler);

            // Add to embed
            embed.addField(`#${i + 1}`, currentProficiency.name);

            currentIndex++;
          }

          handler.startCollecting(authorId);

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
    });
  }

  public SelectFramework(
    client: Client,
    channel: TextChannel | DMChannel,
    authorId: string
  ) {
    return new Promise<Proficiency>((resolve, reject) => {
      let startupEmbed = new RichEmbed().setTitle("Select the framework");

      new ApiRequestHandler(client)

        // Set params for requestAPI
        .requestAPIWithType<Proficiency[]>(
          "GET",
          null,
          `/proficiency/getFrameworks`
        )

        // When everything went right, we receive a proficiency back, so we add the h2h-er to the proficiency channel
        .then(async proficiencies => {
          let startIndex = 0;
          let perPage = 5;
          let endIndex = startIndex + perPage;
          let max = proficiencies ? proficiencies.length : 0;

          let sentEmbed = (await channel
            .send(startupEmbed)
            .catch(console.error)) as Message;
          let handler = new RichEmbedReactionHandler<TicketLangueWithHandler>(
            startupEmbed,
            sentEmbed
          );

          handler.addCategory("tickets", new Map());

          handler.setCurrentCategory("tickets");

          let sendEmojis = async () => {
            let currentIndex = 0;
            for (let i = 0; i < (max <= 10 ? max : 10); i++) {
              // Get emoji for proficiency number ()
              let emoji = getEmojiForNumber(currentIndex);
              await sentEmbed.react(emoji);
              currentIndex++;
            }
          };

          let embed = new RichEmbed().setTitle("Choose the framework");
          let currentIndex = 0;
          sendEmojis();
          for (let i = 0; i < max; i++) {
            // Get current proficiency
            let currentProficiency = proficiencies[i];
            // Get emoji for proficiency number ()
            let emoji = getEmojiForNumber(currentIndex);

            // Remove emoji click if exists
            handler.removeIfExistsEmoji("tickets", emoji);

            // Add emoji click for current proficiency
            handler.addEmoji("tickets", emoji, {
              clickHandler: async data => {
                // resolve with chosen language
                resolve(data.proficiency);

                return { embed, category: "tickets" };
              },
              proficiency: currentProficiency
            } as TicketLangueWithHandler);

            // Add to embed
            embed.addField(`#${i + 1}`, currentProficiency.name);

            currentIndex++;
          }

          handler.startCollecting(authorId);

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
    });
  }
}

interface TicketLangueWithHandler {
  clickHandler: (
    data: TicketLangueWithHandler
  ) => Promise<{ embed: RichEmbed; category: string }>;
  proficiency: Proficiency;
}
