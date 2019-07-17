import { TextChannel, Client } from "discord.js";
import { IntentData } from "../models/intentData";
import { ClientHelper } from "../helpers/clientHelper";
import { ConfigManager } from "../configManager";
import * as fs from "fs";
import * as Luis from "luis-sdk-async";
import { Intent } from "../models/intent";

export class LuisCommandHandler {
  private static luis;
  private static intents: Intent[] = [];

  public static setLuis = luis => (LuisCommandHandler.luis = luis);

  public static getLuis = () => LuisCommandHandler.luis;

  public static getIntents = () => LuisCommandHandler.intents;

  public static async handle(text, message) {
    let chan = message.channel as TextChannel;

    if (
      chan.parent.name.toLowerCase() !== "languages" &&
      chan.parent.name.toLowerCase() !== "frameworks-libraries"
    )
      return;
    if (text.length <= 0) return;
    if (text.length > 500) text = text.substr(0, 500);
    try {
      await this.luis.send(text);
    } catch (err) {
      console.error(err);
    }

    try {
      let intentWord = this.luis.intent();
      if (this.luis.response.topScoringIntent.score < 0.9) return;

      for (const intent of this.intents) {
        if (!intent.isValid(intentWord)) {
          continue;
        }

        let intentData = new IntentData();
        intentData.message = message;
        intentData.client = ClientHelper.getClient() as Client;
        intentData.config = ConfigManager.GetConfig();

        await intent.process(intentData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Loads all Intents
  public static loadIntents(intentsPath: string, dataPath: string) {
    fs.readdir(`${intentsPath}/`, (err, files) => {
      if (err) {
        return console.error(err);
      }

      files.forEach(file => {
        // Load the file at the given path
        let intentClass = require(`${intentsPath}/${file}`).default;

        // Cast the file to be a bot command
        let intent = new intentClass() as Intent;

        // Add to commands list
        LuisCommandHandler.intents.push(intent);

        // Inform that command has been loaded
        console.log(`intent "${file}" loaded...`);
      });
    });
  }
}
