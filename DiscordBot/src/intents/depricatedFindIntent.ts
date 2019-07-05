import BaseIntent from "../baseIntent";
import { RichEmbed } from "discord.js"
import { IntentData } from "../models/intentData";

export default class DeprecatedFindIntent extends BaseIntent {

  intent = "faqs.deprecatedfind";

  public async process(intentData: IntentData): Promise<void> {

    let embed = new RichEmbed();

    embed.setTitle(
      "We think you might be using a deprecated function (FIND)"
    );

    embed.setDescription("We've added an faq item about this! #f-a-q");

    intentData.message.channel.send(embed);
  }
}