import BaseIntent from "../baseIntent";
import { RichEmbed } from "discord.js"
import { IntentData } from "../models/intentData";

export default class ChangePrefixIntent extends BaseIntent {

    intent = "faqs.changeprefix";

    public async process(intentData: IntentData): Promise<void> {

        let embed = new RichEmbed();

        embed.setTitle("Do you want to change your bots prefix?");

        embed.setDescription("We've added an faq item about this! #f-a-q");

        intentData.message.channel.send(embed);
    }
}