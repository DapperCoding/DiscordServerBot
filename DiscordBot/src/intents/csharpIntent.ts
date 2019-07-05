import BaseIntent from "../baseIntent";
import { RichEmbed } from "discord.js"
import { IntentData } from "../models/intentData";

export default class CsharpIntent extends BaseIntent {

    intent = "faqs.csharp";

    public async process(intentData: IntentData): Promise<void> {

        let embed = new RichEmbed();

        embed.setTitle("Do you want to start coding in C#?");

        embed.setDescription("We've added an faq item about this! #f-a-q");

        intentData.message.channel.send(embed);
    }
}