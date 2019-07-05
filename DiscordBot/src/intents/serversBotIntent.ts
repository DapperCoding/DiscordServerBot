import BaseIntent from "../baseIntent";
import { RichEmbed } from "discord.js"
import { IntentData } from "../models/intentData";

export default class ServersBotIntent extends BaseIntent {

    intent = "faqs.serversbot";

    public async process(intentData: IntentData): Promise<void> {

        let embed = new RichEmbed();

        embed.setTitle("Looking for our github repository?");

        embed.setDescription("We've added an faq item about this! #f-a-q");

        intentData.message.channel.send(embed);
    }
}