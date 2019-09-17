import * as Discord from "discord.js";
import * as API from "../api";
import { Message } from "../models/message";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { TicketReaction } from "../models/ticket/ticketReaction";
import { TeacherFormReplyModel } from "../models/forms/formReplies";

export class MessageService {
  private _serverBot: Discord.Client;
  private _config: API.IBotConfig;

  constructor(serverBot: Discord.Client, config: API.IBotConfig) {
    this._serverBot = serverBot;
    this._config = config;
  }

  public addBotMessage(message: Discord.Message) {
    let discordMessage = new Message();

    discordMessage.message = message.content;
    discordMessage.messageId = message.id;
    discordMessage.timestamp = new Date(message.createdTimestamp);
    discordMessage.guildId = message.guild.id;
    discordMessage.channelId = message.channel.id;
    discordMessage.isEmbed = false;
    discordMessage.isDm = false;

    // Request API and add our reaction to the database.
    new ApiRequestHandler()
      .requestAPI("POST", discordMessage, "discordMessage")
      .catch(console.error);
  }

  public handleMessageInTicketCategory(message: Discord.Message) {
    // Now using luis
    // if (message.content.indexOf("TypeError [ERR_INVALID_ARG_TYPE]: The \"file\" argument must be of type string.") >= 0) {
    //     let embed = this.createYtdlEmbed(message.member, message);
    //     message.channel.send(embed);
    // }

    // Get ticket channel id from channel name
    if (message.channel.type !== "text") return;
    let ticketChannelId = (message.channel as Discord.TextChannel).name
      .toString()
      .replace("ticket", "")
      .toString();

    let reaction = new TicketReaction();

    // Fill ticket reaction model
    reaction.ticketId = parseInt(ticketChannelId);
    reaction.fromId = message.author.id;
    reaction.username = message.author.username;

    reaction.discordMessage = new Message();

    reaction.discordMessage.message =
      message.content.length > 0 ? message.content : "EMPTY";
    reaction.discordMessage.messageId = message.id;
    reaction.discordMessage.timestamp = new Date(message.createdTimestamp);
    reaction.discordMessage.guildId = message.guild.id;
    reaction.discordMessage.channelId = message.channel.id;
    reaction.discordMessage.isEmbed = false;
    reaction.discordMessage.isDm = false;

    new ApiRequestHandler()
      .requestAPIWithType<number>(
        "GET",
        null,
        `discordMessage/${message.id}/${message.channel.id}/${message.guild.id}`
      )
      .then(id => {
        if (id < 0) {
          new ApiRequestHandler()
            .requestAPI("POST", reaction, "ticket/reaction")
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          new ApiRequestHandler()
            .requestAPI(
              "POST",
              reaction.discordMessage,
              `discordMessage/${message.id}/${message.channel.id}/${message.guild.id}`
            )
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.error(err);
            });
        }
      })
      .catch(err => {
        console.error(err);
      });

    // Request API and add our reaction to the database.
  }

  public handleMessageInInterviewChannel(message: Discord.Message) {
    // Now using luis
    // if (message.content.indexOf("TypeError [ERR_INVALID_ARG_TYPE]: The \"file\" argument must be of type string.") >= 0) {
    //     let embed = this.createYtdlEmbed(message.member, message);
    //     message.channel.send(embed);
    // }

    // Get ticket channel id from channel name
    if (message.channel.type !== "text") return;
    let channelName = (message.channel as Discord.TextChannel).name.toString();
    let channelNameParts = channelName.split("-");
    if (channelNameParts.length < 2) {
      // TOOD: shouldn't ever happen
      return;
    }
    let id = channelNameParts[1];
    let reaction = {} as TeacherFormReplyModel;

    // Fill ticket reaction model
    reaction.formId = parseInt(id);
    reaction.discordId = message.author.id;

    reaction.discordMessage = new Message();

    reaction.discordMessage.message =
      message.content.length > 0 ? message.content : "EMPTY";
    reaction.discordMessage.messageId = message.id;
    reaction.discordMessage.timestamp = new Date(message.createdTimestamp);
    reaction.discordMessage.guildId = message.guild.id;
    reaction.discordMessage.channelId = message.channel.id;
    reaction.discordMessage.isEmbed = false;
    reaction.discordMessage.isDm = false;

    new ApiRequestHandler()
      .requestAPIWithType<number>(
        "GET",
        null,
        `discordMessage/${message.id}/${message.channel.id}/${message.guild.id}`
      )
      .then(id => {
        if (id < 0) {
          new ApiRequestHandler()
            .requestAPI(
              "POST",
              reaction,
              `forms/${this.TransformNamePartToUrlPart(
                channelNameParts[0]
              )}/${id}/reply`
            )
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          new ApiRequestHandler()
            .requestAPI(
              "POST",
              reaction.discordMessage,
              `discordMessage/${message.id}/${message.channel.id}/${message.guild.id}`
            )
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.error(err);
            });
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  private TransformNamePartToUrlPart(namePart: string) {
    switch (namePart) {
      case "architect":
        return "ideas/architect";
      default:
        return namePart;
    }
  }

  /**
   * Updates the embed, removes the old one, sends a new one to a new channel
   * @param oldChannelId Used for getting oldMessage
   * @param oldMessageId Id of current oldMessage
   * @param newChannelId Channel id where we'll send the new oldMessage to
   * @param message New oldMessage to be placed in some channel
   */
  public updateEmbedToNewChannel(
    oldChannelId: string,
    oldMessageId: string,
    newChannelId: string,
    message: Discord.Message | Discord.RichEmbed
  ) {
    //Return new promise, resolves if the new discordMessage is sent
    return new Promise<string>(async (resolve, reject) => {
      // Get current guild
      let guild = this._serverBot.guilds.get(this._config.serverId);

      if (!guild) return reject("Server not found");

      // Get old channel
      let channel = guild.channels.get(oldChannelId) as Discord.TextChannel;

      if (!channel) return reject("Old channel not found");

      // Get old oldMessage
      let oldMessage = await channel.fetchMessage(oldMessageId);

      if (!oldMessage) return reject("Old message not found");

      // Get new channel
      let newChannel = guild.channels.get(newChannelId) as Discord.TextChannel;

      if (!newChannel) return reject("New channel not found");

      // Delete old oldMessage
      oldMessage.delete(0);

      // Send new discordMessage & resolve with id
      return newChannel
        .send(message)
        .then(msg => {
          return resolve((msg as Discord.Message).id);
        })
        .catch(reject);
    });
  }
}
