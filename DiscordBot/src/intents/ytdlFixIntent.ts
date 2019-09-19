import BaseIntent from "../baseIntent";
import { RichEmbed } from "discord.js";
import { IntentData } from "../models/intentData";
import { Constants } from "../constants";

export default class YtdlFixIntent extends BaseIntent {
  intent = "ytdlfix";

  public async process(intentData: IntentData): Promise<void> {
    let matches = intentData.message.content.match(/\bhttps?:\/\/\S+/gi);
    let url = "https://dapperdino.co.uk/ytdl-fix.zip";

    if (matches != null) {
      url = matches[0];
    }

    let rtfmEmbed = new RichEmbed()
      .setColor(Constants.EmbedColors.YELLOW)
      .setTitle("The YTDL Fix")
      .setURL(url)
      .addField(
        "Please download the zip file " +
          intentData.message.member.displayName +
          ".",
        "The teacher team asks you to download the zip file and extract the files to your node_modules folder (overwrite files)."
      )
      .addField(
        "Video explanation:",
        "https://www.youtube.com/watch?v=MsMYrxyYNZc"
      )
      .setFooter(
        "If you keep experiencing errors, feel free to ask your question in a ticket."
      );

    intentData.message.channel.send(rtfmEmbed);
  }
}
