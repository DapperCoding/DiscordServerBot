import { faq } from "../models/faq/faq";
import { resourceLink } from "../models/faq/resourceLink";
import { dialogueStep, dialogueHandler } from "../handlers/dialogueHandler";
import * as discord from "discord.js";
import { faqHandler } from "../handlers/faqHandler";
import * as api from "../api";
import { faqMessage } from "../models/faq/faqMessage";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import * as msg from "../models/message";

export class faqDialogue {
  private _config: api.IBotConfig;
  private _channel: discord.TextChannel;
  private _user: discord.GuildMember;
  private _bot: discord.Client;

  /**
   * Create dialogue for faq
   */
  constructor(
    config: api.IBotConfig,
    channel: discord.TextChannel,
    user: discord.GuildMember,
    bot: discord.Client
  ) {
    this._config = config;
    this._channel = channel;
    this._user = user;
    this._bot = bot;
  }

  public addQuestion = (response: discord.Message, data: faq): Promise<faq> => {
    return new Promise<faq>((resolve, reject) => {
      try {
        data.question = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public addAnswer = (response: discord.Message, data: faq): Promise<faq> => {
    return new Promise<faq>((resolve, reject) => {
      try {
        data.answer = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public addFaqUrl = (response: discord.Message, data: faq): Promise<faq> => {
    return new Promise<faq>((resolve, reject) => {
      try {
        if (data.resourceLink == null) {
          data.resourceLink = new resourceLink();
        }

        data.resourceLink.link = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public addFaqUrlMask = (
    response: discord.Message,
    data: faq
  ): Promise<faq> => {
    return new Promise<faq>((resolve, reject) => {
      try {
        data.resourceLink.displayName = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  };

  public startUsefulResource = (
    response: discord.Message,
    data: faq
  ): Promise<faq> => {
    return new Promise<faq>(async (resolve, reject) => {
      let yeses = ["yes", "yea", "yeah", "ye", "y"];

      if (yeses.find(yes => response.content.toLowerCase() == yes)) {
        let faqUrlStep: dialogueStep<faq> = new dialogueStep(
          data,
          this.addFaqUrl,
          "Enter URL:",
          "URL Successful",
          "URL Unsuccessful"
        );
        let faqUrlMaskStep: dialogueStep<faq> = new dialogueStep(
          data,
          this.addFaqUrlMask,
          "Enter URL Mask:",
          "URL Mask Successful",
          "URL Mask Unsuccessful"
        );
        let handler: dialogueHandler<faq> = new dialogueHandler<faq>(
          [faqUrlStep, faqUrlMaskStep],
          data
        );

        return resolve(
          await handler.getInput(this._channel, this._user, this._config)
        );
      }

      return resolve(data);
    });
  };

  public finalizeSteps = (data: faq) => {
    let faqEmbed = new discord.RichEmbed()
      .setTitle("-Q: " + data.question)
      .setDescription("-A: " + data.answer)
      .setColor("#2dff2d");

    if (
      data.resourceLink != null &&
      data.resourceLink.link != null &&
      data.resourceLink.displayName != null
    )
      faqEmbed.addField(
        "Useful Resource: ",
        `[${data.resourceLink.displayName}](${data.resourceLink.link})`
      );
    new faqHandler(this._config)
      .addFaq(data)
      .then(faqData => {
        let guild = this._bot.guilds.get(this._config.serverId);
        if (guild == null) return;
        (guild.channels.find(
          channel => channel.name === "f-a-q"
        ) as discord.TextChannel)
          .send(faqEmbed)
          .then(newMsg => {
            this.setFaqMessageId(newMsg as discord.Message, faqData.id);
          });
      })
      .catch(err => {
        console.error(err);
      });

    return data;
  };

  private setFaqMessageId(message: discord.Message, faqId: number) {
    let faqMessageObject = new faqMessage();

    faqMessageObject.id = faqId;

    faqMessageObject.message = new msg.message();

    faqMessageObject.message.channelId = message.channel.id;
    faqMessageObject.message.guildId = message.guild.id;
    faqMessageObject.message.isEmbed = message.embeds.length > 0;
    faqMessageObject.message.messageId = message.id;
    faqMessageObject.message.isDm =
      message.channel instanceof discord.DMChannel;

    faqMessageObject.message.timestamp = new Date(message.createdTimestamp);

    new apiRequestHandler().requestAPI(
      "POST",
      faqMessageObject,
      "https://api.dapperdino.co.uk/api/faq/AddMessageId",
      this._config
    );
  }
}
