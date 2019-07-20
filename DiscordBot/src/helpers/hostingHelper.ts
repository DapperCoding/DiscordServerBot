import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Client, MessageReaction, User, TextChannel, RichEmbed, Message } from "discord.js";
import { RichEmbedReactionHandler } from "../genericRichEmbedReactionHandler";

export class HostingHelper {

    public static getProductById(id: number) {

    }

    public static getHostingPackages(client: Client) {
        new ApiRequestHandler(client).requestAPIWithType<any>("GET", null, "hosting")
    }

    public static async createReactionHandler(client: Client, userId: string, channel: TextChannel, trueReaction?: string, falseReaction?: string) {
        const products = HostingHelper.getHostingPackages(client);
        const categoryName = "hosting";
        const embed = new RichEmbed();
        embed.setTitle("Hosting Options");

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

        const sent = await channel.send(embed) as Message;

        let tReact = trueReaction != null && trueReaction.length > 0 ? trueReaction : "👍";
        let fReact = falseReaction != null && falseReaction.length > 0 ? falseReaction : "👎";

        sent.awaitReactions((reaction: MessageReaction, user: User) => ((reaction.emoji.name === tReact || reaction.emoji.name == fReact) && user.id == userId), { max: 1 }).then(collected => {
            const userReaction = collected.filter(x => x.users.filter(y => y.id == userId).size > 0).first();
            const user = userReaction ? userReaction.users.filter(y => y.id == userId).first() : null;

            if (user) {
                if (userReaction.emoji.name === "👍") {

                }
                sent.delete();
                channel.send("Thanks for requesting contact about our hosting services, we'll contact you soon!")
            }
        })
    }
}