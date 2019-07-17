import { Client, RichEmbed } from "discord.js";
import { SuggestionConverters } from "../../converters/suggestionConverters";

export class SuggestionUpdateEvent {
  public static handle(serverBot: Client, suggestion: any) {
    // Get user that suggested this suggestion
    let suggestor = serverBot.users.get(suggestion.discordUser.discordId);

    // Check if found
    if (suggestor) {
      // Create suggestion embed
      let suggestionUpdateEmbed = new RichEmbed({})
        .setTitle("Your suggestion has been updated!")
        .setColor("0xff0000")
        .addField(
          "Here you will find the information about your updated suggestion:",
          `https://dapperdino.co.uk/Client/Suggestion/${suggestion.id}`
        )
        .addField("Suggestion description:", suggestion.description)
        .addField(
          "Suggestion Type:",
          SuggestionConverters.suggestionTypeText(suggestion.type)
        )
        .addField(
          "Suggestion Status:",
          SuggestionConverters.suggestionStatusText(suggestion.status)
        )
        .addField(
          "Thanks as always for being a part of the community.",
          "It means a lot!"
        )
        .setFooter("With ❤ By the DapperCoding team");

      // Send embed to suggestor
      suggestor.send(suggestionUpdateEmbed).catch(console.error);
    }

    return true;
  }
}
