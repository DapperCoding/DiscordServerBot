import { Client, RichEmbed, TextChannel, Guild } from "discord.js";
import { SuggestionConverters } from "../../converters/suggestionConverters";
import { Suggest } from "../../models/suggest";

export class SuggestionEvent {
  public static handle(server: Guild, serverBot: Client, suggestion: Suggest) {
    // Get user that suggested this suggestion
    const suggestor = serverBot.users.get(suggestion.discordUser.discordId);

    // Create suggestion embed
    const suggestionEmbed = new RichEmbed({})
      .setTitle("Your suggestion has been created!")
      .setColor("0xff0000")
      .addField(
        "Here you will find the information about the suggestion:",
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
      .setFooter("With ❤ the DapperCoding team");
    // Check if found
    if (suggestor) {
      // Send embed to suggestor
      suggestor.send(suggestionEmbed).catch(console.error);

      suggestionEmbed.setTitle(`${suggestor.username} suggested something.`);
      suggestionEmbed.setDescription(
        `Happy To Help link: https://dapperdino.co.uk/HappyToHelp/Suggestion/${
          suggestion.id
        }`
      );
      const h2hChat = server.channels.find(
        channel => channel.name.toLowerCase() === "dapper-team"
      ) as TextChannel;

      h2hChat.send(suggestionEmbed);
    }
  }
}
