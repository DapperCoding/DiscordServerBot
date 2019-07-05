import BaseIntent from "../baseIntent";
import { RichEmbed } from "discord.js"
import { IntentData } from "../models/intentData";

export default class NotFoundModuleIntent extends BaseIntent {

  intent = "faqs.notfoundmodule";

  public async process(intentData: IntentData): Promise<void> {

    let embed = new RichEmbed();

    embed.setTitle(
      "We think you might be opening your terminal from a wrong directory"
    );

    embed.setDescription("We've added an faq item about this! #f-a-q");

    intentData.message.channel.send(embed);
  }
}