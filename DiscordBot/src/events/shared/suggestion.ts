import { Client, RichEmbed, TextChannel, Guild } from "discord.js";
import { SuggestionConverters } from "../../converters/suggestionConverters";
import { Suggest } from "../../models/suggest";
import { Constants } from "../../constants";

export class SuggestionEvent {
  public static handle(server: Guild, serverBot: Client, suggestion: Suggest) {

    // Create suggestion embed
    let suggestionEmbed = new RichEmbed({})
      .setTitle("Your suggestion has been created!")
      .setColor(Constants.EmbedColors.GREEN)
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


    suggestionEmbed.setDescription(
      `teacher link: https://teacher.dapperdino.co.uk/Suggestion/${suggestion.id}`
    );

    suggestionEmbed = SuggestionEvent.sendMessageToUser(suggestion, suggestionEmbed, serverBot);
    SuggestionEvent.sendMessageToDapperTeam(server, suggestionEmbed);
  }

  private static sendMessageToUser(suggestion: Suggest, embed: RichEmbed, serverBot: Client):RichEmbed {
    if (!suggestion.discordUser) return embed;
    // Get user that suggested this suggestion
    const suggestor = serverBot.users.get(suggestion.discordUser.discordId);

    if (!suggestor) return embed;

    // Send embed to suggestor
    suggestor.send(embed).catch(console.error);

    embed.setTitle(`${suggestor.username} suggested something.`);

    return embed;
  }

  private static sendMessageToDapperTeam(server:Guild, embed:RichEmbed) {

    const h2hChat = server.channels.find(
      channel => channel.name.toLowerCase() === "dapper-team"
    ) as TextChannel;

    h2hChat.send(embed);
  }
}
