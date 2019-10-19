import { SuggestionTypes, Suggest } from "../models/suggest";
import { DiscordUser } from "../models/discordUser";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import * as discord from "discord.js";
import * as api from "../api";
import { ValidationError } from "../error";

export class SuggestionDialogue {
  private _message: discord.Message;

  /**
   *
   */
  constructor(message: discord.Message) {
    this._message = message;
  }

  /**
   * addDescription
   */
  public addDescription(
    response: discord.Message,
    data: SuggestionDialogueData
  ) {
    return new Promise<SuggestionDialogueData>((resolve, reject) => {
      try {
        data.description = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public handleAPI = (data: SuggestionDialogueData) => {
    return new Promise<Suggest>(async (resolve, reject) => {
      // Create new suggestion
      let suggestion: Suggest = new Suggest();

      // Set description
      suggestion.description = data.description;

      // Add discord user information to the suggestion
      suggestion.discordUser = new DiscordUser();
      suggestion.discordUser.username = this._message.member.displayName;
      suggestion.discordUser.discordId = this._message.member.id;

      const categories = ["Bot", "🕸", "🗨", "📹"];
      const msg = await this._message.channel.send("Please select the suggestion type.");
      await (msg as discord.Message).react(':Bot:485871485421092874');
      await (msg as discord.Message).react('🕸');
      await (msg as discord.Message).react('🗨');
      await (msg as discord.Message).react('📹');

      const collector = this._message.createReactionCollector(
        (reaction: discord.MessageReaction, user: discord.User) => ["Bot", "🕸", "🗨", "📹"].includes(reaction.emoji.name) && user.id === this._message.author.id
      );

      suggestion.type = SuggestionTypes.Undecided;

      collector.on('collect', r => {

        // This should never happen because of the filter in the ReactionCollector, but just in case.
        if (!categories.includes(r.emoji.name)) return;

        if (r.emoji.name === 'Bot') suggestion.type = SuggestionTypes.Bot;
        else if (r.emoji.name === '🕸') suggestion.type = SuggestionTypes.Website;
        else if (r.emoji.name === '🗨') suggestion.type = SuggestionTypes.General;
        else if (r.emoji.name === '📹') suggestion.type = SuggestionTypes.YouTube;

      });

      return new ApiRequestHandler()
        .requestAPIWithType<Suggest>("POST", suggestion, "suggestion")
        .then(resolve)
        .catch(reject); // TODO: Create json file with ticket info (if you want to get crazy: with automated cleanup system for the json files node-schedule)
    });
  };
}

export class SuggestionDialogueData {
  public category: string = "";
  public description: string = "";
}
