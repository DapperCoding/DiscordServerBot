import BaseIntent from "../baseIntent";
import { IntentData } from "../models/intentData";
import { RichEmbed, Message, User, TextChannel, MessageReaction } from "discord.js";

export default class HostingIntent extends BaseIntent {

  intent = "hosting";

  public async process(intentData: IntentData): Promise<void> {
    let embed = new RichEmbed();

    embed.setTitle("DapperCoding Hosting Service");

    embed.setDescription("Are you interested in hosting your discord bot?\n\nIf you are, react with 👍 or react with 👎 if you are not");

    intentData.message.channel.send(embed).then(async (sentMessage) => {
        const msg = sentMessage as Message;
        await msg.react("👍");
        await msg.react("👎");
        msg.awaitReactions(
            (reaction, user) =>
                (reaction.emoji.name === '👍' || reaction.emoji.name == '👎')
                && user.id === intentData.message.author.id,
            { max: 1 })
            .then(collected => {
                const userReaction = collected.first();
                const user = this.getUser(userReaction) as User|null;
                if (!userReaction || !user) return;
                if (userReaction.emoji.name === "👍") {

                    const requestContactEmbed = new RichEmbed()
                        .setTitle("A user requested contact about the hosting services")
                        .setDescription(`user ${user.username}#${user.tag} (${user.id}) requested contact`);
                    const channel = msg.guild.channels.find(x=>x.name.toLowerCase() === "dapper-coding") as TextChannel;

                    channel.send(requestContactEmbed);
                    msg.channel.send("Thanks for requesting contact about our hosting service, we'll inform you asap.")
                }
                msg.delete();
            })
    })

}

private getUser = (userReaction: MessageReaction) => {
    let retUser: User | null = null;
    userReaction.users.forEach(user => {
        if (!user.bot)
            retUser = user;
    });
    return retUser;
}
}