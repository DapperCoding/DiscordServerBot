import { RichEmbed } from "discord.js";
import { Constants } from "../constants";

export class ErrorEmbed {
  public static Build(error: string) {
    return new RichEmbed()
      .setTitle("There's been an error")
      .setDescription(error)
      .setColor(Constants.EmbedColors.RED);
  }
}
