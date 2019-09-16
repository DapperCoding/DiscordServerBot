import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import {
  Client,
  MessageReaction,
  User,
  TextChannel,
  RichEmbed,
  Message
} from "discord.js";
import { RichEmbedReactionHandler } from "../genericRichEmbedReactionHandler";
import { ClientHelper } from "./clientHelper";
import { CommissionDialogue } from "../dialogues/commissionDialogue";

export class ProductHelper {
  public static getProductById(id: number) {}

  public static getProducts(client: Client): Promise<any[]> {
    return new ApiRequestHandler(client).requestAPIWithType<any[]>(
      "GET",
      null,
      "product"
    );
  }
  public static async createCustomBotReactionHandler(
    client: Client,
    userId: string,
    channel: TextChannel,
    message: Message | null
  ) {
    let embed = new RichEmbed();

    embed.setTitle("DapperCoding Bot Service");

    embed.setDescription(
      "Are you interested in buying a custom discord bot?\n\nIf you are, react with 👍 or react with 👎 if you are not"
    );
    embed.setFooter(
      `If you want to view all of our current products, react with 🛒`
    );

    let sent: Message | null = null;
    if (message != null) {
      sent = message;
      await sent.edit(embed);
      await sent.clearReactions();
    } else {
      sent = (await channel.send(embed)) as Message;
    }
    await sent.react("👍");
    await sent.react("👎");
    await sent.react("🛒");
    sent
      .awaitReactions(
        (reaction, user) =>
          (reaction.emoji.name === "👍" ||
            reaction.emoji.name == "👎" ||
            reaction.emoji.name === "🛒") &&
          user.id === userId,
        { max: 1 }
      )
      .then(collected => {
        const userReaction = collected.first();
        const user = this.getUser(userReaction) as User | null;
        if (!userReaction || !user) return;
        if (userReaction.emoji.name === "👍") {
          var dialogue = new CommissionDialogue();
          if (sent == null) return;
          dialogue.CreateDialogue(client, sent.channel as TextChannel, userId);
        } else if (userReaction.emoji.name === "🛒") {
          const client = ClientHelper.getClient() as Client;
          ProductHelper.createProductOverviewReactionHandler(
            client,
            userId,
            channel as TextChannel,
            sent
          );
        } else {
          if (sent) sent.delete();
        }
      });
  }

  public static async createProductOverviewReactionHandler(
    client: Client,
    userId: string,
    channel: TextChannel,
    message: Message | null
  ) {
    ProductHelper.getProducts(client).then(async products => {
      let embed = new RichEmbed();
      embed.setTitle("Product Catalog");
      embed.setFooter(
        "React with one of the numbers to view the product\nClick on '🛒' to view the custom bot service\nOr cancel with '❌'"
      );

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
      let getNumberForEmoji = (emoji: string): number => {
        for (let i = 0; i < reaction_numbers.length; i++) {
          if (getEmojiForNumber(i) === emoji) {
            return i;
          }
        }
        return -1;
      };
      let getEmojiForNumber = (i: number): string => {
        return reaction_numbers[i];
      };
      let mapped = products.map((v, index) =>
        getEmojiForNumber(index)
      ) as string[];
      let emojis = ["🛒", ...mapped, "❌"];

      products.forEach((product, index) => {
        embed.addField(`#${index + 1} ${product.name}`, "$" + product.price);
      });

      let sent: Message | null = null;

      if (message != null) {
        sent = message;
        await sent.edit(embed);
        await sent.clearReactions();
      } else {
        sent = (await channel.send(embed)) as Message;
      }

      for (let i = 0; i < emojis.length; i++) {
        await sent.react(emojis[i]);
      }

      sent
        .awaitReactions(
          (reaction: MessageReaction, user: User) => {
            return emojis.includes(reaction.emoji.name) && user.id == userId;
          },
          { max: 1 }
        )
        .then(collected => {
          const userReaction = collected
            .filter(x => x.users.filter(y => y.id == userId).size > 0)
            .first();
          const user = userReaction
            ? userReaction.users.filter(y => y.id == userId).first()
            : null;

          if (user) {
            const productIndex = getNumberForEmoji(userReaction.emoji.name);
            const productId =
              productIndex >= 0 && productIndex < products.length
                ? products[productIndex].id
                : 0;
            if (productId && productId > 0) {
              ProductHelper.createProductInfoReactionHandler(
                productId,
                client,
                userId,
                channel,
                sent
              );
            } else if (userReaction.emoji.name === "🛒") {
              ProductHelper.createCustomBotReactionHandler(
                client,
                userId,
                channel,
                sent
              );
            } else if (userReaction.emoji.name === "❌") {
              if (sent) sent.delete();
            }
          }
        });
    });
  }

  public static async createProductInfoReactionHandler(
    id: number,
    client: Client,
    userId: string,
    channel: TextChannel,
    message: Message | null
  ) {
    new ApiRequestHandler(client)
      .requestAPIWithType<any>("GET", null, "product/" + id)
      .then(async product => {
        const embed = new RichEmbed()
          .setTitle(
            `Information about our '${product.name}' ($${product.price})`
          )
          .setDescription(product.description)
          .setURL("https://dapperdino.co.uk/Products/Information/" + product.id)
          .setFooter(
            "Click on the title to open in your web browser\nReact with '🛒' to view the overview of products\nOr react with '❌' to cancel"
          );

        if (product.instructions) {
          embed.addField(
            product.instructions.name,
            product.instructions.description
          );
        }

        if (product.categories && product.categories.length > 0) {
          let categoryField = "";
          for (let i = 0; i < product.categories.length; i++) {
            let cat = product.categories[i].productCategory;
            categoryField += `${cat.name} (${cat.description}) \n`;
          }
          embed.addField("Categories", categoryField);
        }

        if (product.productImages && product.productImages.length > 0) {
          for (let i = 0; i < product.productImages.length; i++) {
            let image = product.productImages[i];

            if (image.isHeaderImage) {
              embed.setImage(image.url);
            }
          }
        }

        let sent: Message | null = null;
        if (message != null) {
          sent = message;
          await message.edit(embed);
          await message.clearReactions();
        } else {
          sent = (await channel.send(embed)) as Message;
        }

        await sent.react("🛒");
        await sent.react("❌");

        sent
          .awaitReactions(
            (reaction: MessageReaction, user: User) =>
              (reaction.emoji.name === "🛒" || reaction.emoji.name === "❌") &&
              user.id == userId,
            { max: 1 }
          )
          .then(collected => {
            const userReaction = collected
              .filter(x => x.users.filter(y => y.id == userId).size > 0)
              .first();
            const user = userReaction
              ? userReaction.users.find(y => y.id == userId)
              : null;

            if (user) {
              if (userReaction.emoji.name === "🛒") {
                ProductHelper.createProductOverviewReactionHandler(
                  client,
                  userId,
                  channel,
                  sent
                );
              } else {
                if (sent) sent.delete();
              }
            }
          });
      })
      .catch(err => {
        channel.send("Something went wrong, please try again later");
        if (message) message.delete();

        const teamChannel = channel.guild.channels.find(
          x => x.name.toLowerCase() === "dapper-team"
        ) as TextChannel;

        teamChannel.send(
          `Error occured getting product information for id ${id} <@211115689807839232>`
        );
        console.error(err);
      });
  }

  private static getUser = (userReaction: MessageReaction) => {
    let retUser: User | null = null;
    userReaction.users.forEach(user => {
      if (!user.bot) retUser = user;
    });
    return retUser;
  };
}
