import BaseIntent from "../baseIntent";
import { RichEmbed } from "discord.js"
import { IntentData } from "../models/intentData";

export default class DiscordNotFoundIntent extends BaseIntent {

  intent = "faqs.discordnotfound";

  public async process(intentData: IntentData): Promise<void> {

    let embed = new RichEmbed();

    embed.setTitle(
      "We think you might have forgotten to install the discord.js npm libraries"
    );

    embed.setDescription("We've added an faq item about this! #f-a-q");

    intentData.message.channel.send(embed);
  }
}