import * as Discord from "discord.js";
import * as API from "../api";
import { ApiRequestHandler } from "./apiRequestHandler";
import { FaqMessage } from "../models/faq/faqMessage";
import { Faq } from "../models/faq/faq";
import { ReceiveFaq } from "../models/faq/receiveFaq";
import { Message } from "../models/message";

export class FaqHandler {
  constructor(config: API.IBotConfig) {}

  // Create new faq item by using the API
  public async addFaq(faqObject: Faq) {
    // Create new promise
    return new Promise<ReceiveFaq>(async (resolve, reject) => {
      // Return finished request
      return new ApiRequestHandler()
        .requestAPIWithType<ReceiveFaq>("POST", faqObject, "/api/faq")
        .then(faqReturnObject => {
          return resolve(faqReturnObject);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  // Sets faq discordMessage in the database through our API
  public setFaqMessageId(
    message: Discord.Message,
    faqId: number,
    config: API.IBotConfig
  ) {
    // Create new faqMessage object
    let faqMessageObject = new FaqMessage();

    // Fill with faq & discordMessage id
    faqMessageObject.id = faqId;

    faqMessageObject.message = new Message();

    faqMessageObject.message.channelId = message.channel.id;
    faqMessageObject.message.guildId = message.guild.id;
    faqMessageObject.message.isEmbed = message.embeds.length > 0;
    faqMessageObject.message.messageId = message.id;
    faqMessageObject.message.isDm =
      message.channel instanceof Discord.DMChannel;

    faqMessageObject.message.timestamp = new Date(message.createdTimestamp);
    // Request API
    new ApiRequestHandler().requestAPI(
      "POST",
      faqMessageObject,
      "/api/faq/AddMessageId"
    );
  }
}
