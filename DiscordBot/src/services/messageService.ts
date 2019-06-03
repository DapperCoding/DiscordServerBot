import * as discord from "discord.js";
import * as api from "../api";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import { ticketReaction } from "../models/ticket/ticketReaction";
import { ticketReceive } from "../models/ticket/ticketReceive";
import * as msg from "../models/message";

export class messageService {
  private _serverBot: discord.Client;
  private _config: api.IBotConfig;

  constructor(serverBot: discord.Client, config: api.IBotConfig) {
    this._serverBot = serverBot;
    this._config = config;
  }

  public addBotMessage(message: discord.Message) {
    let discordMessage = new msg.message();

    discordMessage.message = message.content;
    discordMessage.messageId = message.id;
    discordMessage.timestamp = new Date(message.createdTimestamp);
    discordMessage.guildId = message.guild.id;
    discordMessage.channelId = message.channel.id;
    discordMessage.isEmbed = false;
    discordMessage.isDm = false;

    // Request API and add our reaction to the database.
    new apiRequestHandler()
      .requestAPI(
        "POST",
        discordMessage,
        "https://api.dapperdino.co.uk/api/discordMessage",
        this._config
      )
      .then(console.log)
      .catch(console.error);
  }

  public handleMessageInTicketCategory(message: discord.Message) {
    // Now using luis
    // if (message.content.indexOf("TypeError [ERR_INVALID_ARG_TYPE]: The \"file\" argument must be of type string.") >= 0) {
    //     let embed = this.createYtdlEmbed(message.member, message);
    //     message.channel.send(embed);
    // }

    // Get ticket channel id from channel name
    let ticketChannelId = (message.channel as discord.TextChannel).name
      .toString()
      .replace("ticket", "")
      .toString();

    let reaction = new ticketReaction();

    // Fill ticket reaction model
    reaction.ticketId = parseInt(ticketChannelId);
    reaction.fromId = message.author.id;
    reaction.username = message.author.username;

    reaction.discordMessage = new msg.message();

    reaction.discordMessage.message = message.content;
    reaction.discordMessage.messageId = message.id;
    reaction.discordMessage.timestamp = new Date(message.createdTimestamp);
    reaction.discordMessage.guildId = message.guild.id;
    reaction.discordMessage.channelId = message.channel.id;
    reaction.discordMessage.isEmbed = false;
    reaction.discordMessage.isDm = false;

    // Request API and add our reaction to the database.
    new apiRequestHandler()
      .requestAPI(
        "POST",
        reaction,
        "https://api.dapperdino.co.uk/api/ticket/reaction",
        this._config
      )
      .then(console.log)
      .catch(console.error);
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
    message: discord.Message | discord.RichEmbed
  ) {
    //Return new promise, resolves if the new discordMessage is sent
    return new Promise<string>(async (resolve, reject) => {
      // Get current guild
      let guild = this._serverBot.guilds.get(this._config.serverId);

      if (!guild) return reject("Server not found");

      // Get old channel
      let channel = guild.channels.get(oldChannelId) as discord.TextChannel;

      if (!channel) return reject("Old channel not found");

      // Get old oldMessage
      let oldMessage = await channel.fetchMessage(oldMessageId);

      if (!oldMessage) return reject("Old message not found");

      // Get new channel
      let newChannel = guild.channels.get(newChannelId) as discord.TextChannel;

      if (!newChannel) return reject("New channel not found");

      // Delete old oldMessage
      oldMessage.delete(0);

      // Send new discordMessage & resolve with id
      return newChannel
        .send(message)
        .then(msg => {
          return resolve((msg as discord.Message).id);
        })
        .catch(reject);
    });
  }

  private createYtdlEmbed(
    ytdlUser: discord.GuildMember,
    message: discord.Message
  ): discord.RichEmbed {
    let matches = message.content.match(/\bhttps?:\/\/\S+/gi);
    let url = "https://dapperdino.co.uk/ytdl-fix.zip";

    if (matches != null) {
      url = matches[0];
    }

    return new discord.RichEmbed()
      .setColor("#ff0000")
      .setTitle("The YTDL Fix")
      .setURL(url)
      .addField(
        "Please download the zip file " + ytdlUser.displayName + ".",
        message.author +
          " asks you to download the zip file and extract the files to your node_modules folder (overwrite files)."
      )
      .setFooter(
        "If you keep experiencing errors, feel free to ask your question in a ticket."
      );
  }
}
