import { SuggestionTypes, Suggest } from "../models/suggest";
import { DiscordUser } from "../models/discordUser";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import * as discord from "discord.js";
import * as api from "../api";
import { ValidationError } from "../error";

export class SuggestionDialogue {
  private _message: discord.Message;
  private _config: api.IBotConfig;

  /**
   *
   */
  constructor(message: discord.Message, config: api.IBotConfig) {
    this._message = message;
    this._config = config;
  }

  /**
   * addCategory
   */
  public addCategory(response: discord.Message, data: SuggestionDialogueData) {
    return new Promise<SuggestionDialogueData>((resolve, reject) => {
      try {
        const categories = ["bot", "website", "general", "youtube"];

        let category = response.content.toLowerCase().trim();

        if (!categories.includes(category))
          return reject(
            new ValidationError(
              `Chosen category did not exist, please choose one out of these options: ${categories
                .join(", ")
                .trim()}`
            )
          );

        data.category = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
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
    return new Promise<Suggest>((resolve, reject) => {
      // Create new suggestion
      let suggestion: Suggest = new Suggest();

      // Set description
      suggestion.description = data.description;

      // Add discord user information to the suggestion
      suggestion.discordUser = new DiscordUser();
      suggestion.discordUser.username = this._message.member.displayName;
      suggestion.discordUser.discordId = this._message.member.id;

      // Select suggestion type
      switch (data.category.toLowerCase()) {
        case "bot":
          suggestion.type = SuggestionTypes.Bot;
          break;
        case "website":
          suggestion.type = SuggestionTypes.Website;
          break;
        case "general":
          suggestion.type = SuggestionTypes.General;
          break;
        case "youtube":
          suggestion.type = SuggestionTypes.Youtube;
          break;
        default:
          suggestion.type = SuggestionTypes.Undecided;
      }

      return new ApiRequestHandler()
        .requestAPIWithType<Suggest>(
          "POST",
          suggestion,
          "https://api.dapperdino.co.uk/api/suggestion",
          this._config
        )
        .then(resolve)
        .catch(reject); // TODO: Create json file with ticket info (if you want to get crazy: with automated cleanup system for the json files node-schedule)
    });
  };
}

export class SuggestionDialogueData {
  public category: string = "";
  public description: string = "";
}
