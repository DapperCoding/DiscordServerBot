import * as Discord from "discord.js";
import * as API from "../api";
import { Message } from "../models/message";
import { Faq } from "../models/faq/faq";
import { ResourceLink } from "../models/faq/resourceLink";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";
import { FaqHandler } from "../handlers/faqHandler";
import { FaqMessage } from "../models/faq/faqMessage";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { ConfigManager } from "../configManager";
import { Constants } from "../constants";

export class FaqDialogue {
  private _config: API.IBotConfig;
  private _channel: Discord.TextChannel;
  private _user: Discord.GuildMember;
  private _bot: Discord.Client;

  /**
   * Create dialogue for faq
   */
  constructor(
    channel: Discord.TextChannel,
    user: Discord.GuildMember,
    bot: Discord.Client
  ) {
    this._config = ConfigManager.GetConfig();
    this._channel = channel;
    this._user = user;
    this._bot = bot;
  }

  public addQuestion = (response: Discord.Message, data: Faq): Promise<Faq> => {
    return new Promise<Faq>((resolve, reject) => {
      try {
        data.question = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public addAnswer = (response: Discord.Message, data: Faq): Promise<Faq> => {
    return new Promise<Faq>((resolve, reject) => {
      try {
        data.answer = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public addFaqUrl = (response: Discord.Message, data: Faq): Promise<Faq> => {
    return new Promise<Faq>((resolve, reject) => {
      try {
        if (data.resourceLink == null) {
          data.resourceLink = new ResourceLink();
        }

        data.resourceLink.link = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public addFaqUrlMask = (
    response: Discord.Message,
    data: Faq
  ): Promise<Faq> => {
    return new Promise<Faq>((resolve, reject) => {
      try {
        data.resourceLink.displayName = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public startUsefulResource = (
    response: Discord.Message,
    data: Faq
  ): Promise<Faq> => {
    return new Promise<Faq>(async (resolve, reject) => {
      let yeses = ["yes", "yea", "yeah", "ye", "y"];

      if (yeses.find(yes => response.content.toLowerCase() == yes)) {
        let faqUrlStep: DialogueStep<Faq> = new DialogueStep(
          data,
          this.addFaqUrl,
          "Enter URL:",
          "URL Successful",
          "URL Unsuccessful"
        );
        let faqUrlMaskStep: DialogueStep<Faq> = new DialogueStep(
          data,
          this.addFaqUrlMask,
          "Enter URL Mask:",
          "URL Mask Successful",
          "URL Mask Unsuccessful"
        );
        let handler: DialogueHandler<Faq> = new DialogueHandler<Faq>(
          [faqUrlStep, faqUrlMaskStep],
          data
        );

        return resolve(await handler.getInput(this._channel, this._user.user));
      }

      return resolve(data);
    });
  };

  public finalizeSteps = (data: Faq) => {
    let faqEmbed = new Discord.RichEmbed()
      .setTitle("-Q: " + data.question)
      .setDescription("-A: " + data.answer)
      .setColor(Constants.EmbedColors.GREEN);

    if (
      data.resourceLink != null &&
      data.resourceLink.link != null &&
      data.resourceLink.displayName != null
    )
      faqEmbed.addField(
        "Useful Resource: ",
        `[${data.resourceLink.displayName}](${data.resourceLink.link})`
      );
    new FaqHandler(this._config)
      .addFaq(data)
      .then(faqData => {
        let guild = this._bot.guilds.get(this._config.serverId);
        if (guild == null) return;
        (guild.channels.find(
          channel => channel.name === "f-a-q"
        ) as Discord.TextChannel)
          .send(faqEmbed)
          .then(newMsg => {
            this.setFaqMessageId(newMsg as Discord.Message, faqData.id);
          });
      })
      .catch(err => {
        console.error(err);
      });

    return data;
  };

  private setFaqMessageId(message: Discord.Message, faqId: number) {
    let faqMessageObject = new FaqMessage();

    faqMessageObject.id = faqId;

    faqMessageObject.message = new Message();

    faqMessageObject.message.channelId = message.channel.id;
    faqMessageObject.message.guildId = message.guild.id;
    faqMessageObject.message.isEmbed = message.embeds.length > 0;
    faqMessageObject.message.messageId = message.id;
    faqMessageObject.message.isDm =
      message.channel instanceof Discord.DMChannel;

    faqMessageObject.message.timestamp = new Date(message.createdTimestamp);

    new ApiRequestHandler().requestAPI(
      "POST",
      faqMessageObject,
      "api/faq/AddMessageId"
    );
  }
}
