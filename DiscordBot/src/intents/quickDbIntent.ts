import BaseIntent from "../baseIntent";
import { RichEmbed, Message } from "discord.js"
import { IntentData } from "../models/intentData";

export default class QuickDbIntent extends BaseIntent {

    intent = "faqs.quickdb";

    public async process(intentData: IntentData): Promise<void> {

        let embed = new RichEmbed();

        embed.setTitle(
            "We think you might be having trouble installing QuickDb"
        );

        embed.setDescription("We've added an faq item about this! #f-a-q");

        intentData.message.channel.send(embed);
    }
}