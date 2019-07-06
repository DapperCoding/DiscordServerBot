import * as Discord from "discord.js";
import * as API from "../api";
import { ApiRequestHandler } from "./apiRequestHandler";
import { RegisterModel } from "../models/registerModel";
import { DiscordUser } from "../models/discordUser";

export class ConnectHandler {
  private _client: Discord.Client;

  constructor(client: Discord.Client) {
    this._client = client;
  }

  public async registerDiscord(message: Discord.Message) {
    // Return new promise
    return new Promise(async (resolve, reject) => {
      // Register url
      let registerDiscordUrl = "/Account/RegisterDiscord/";

      // Create new registerModel
      let model = new RegisterModel();

      // Add user information
      model.username = message.author.username;
      model.discordId = message.author.id;

      // Add connect code
      //model.registrationCode = message.content.replace("?connect ", "");

      if (
        message.member.roles.find(
          role => role.name.toLowerCase() === "happy to help"
        )
      ) {
        model.isHappyToHelp = true;
      }

      // Request API
      try {
        const discordAccount = await new ApiRequestHandler(
          this._client
        ).requestAPIWithType<DiscordUser>("POST", model, registerDiscordUrl);
        // Send okay message
        this.sendOkMessage(message, discordAccount);
        // Resolve
        return resolve(true);
      } catch (reason_1) {
        // Log & send reason
        console.error(reason_1);
        this.sendRejectMessage(message, reason_1);
        // Reject
        return reject(reason_1);
      }
    });
  }

  public async sendOkMessage(message: Discord.Message, model) {
    message.reply("You have successfully connected your discord account");
  }

  public async sendRejectMessage(message: Discord.Message, reason) {
    message.reply(reason);
  }
}
