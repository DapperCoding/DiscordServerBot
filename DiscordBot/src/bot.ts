import * as Luis from "luis-sdk-async";
import { IBot, IBotConfig, ILogger } from "./api";
import { InDialogue } from "./models/inDialogue";
import { BotCommand } from "./models/botCommand";
import { Client, Guild } from "discord.js";
import { Intent } from "./models/intent";
import { DisconnectEvent } from "./events/bot/disconnect";
import { BotErrorEvent } from "./events/bot/error";
import { ReadyEvent } from "./events/bot/ready";
import { GuildMemberAddEvent } from "./events/bot/guildMemberAdd";
import { GuildMemberRemoveEvent } from "./events/bot/guildMemberRemove";
import { MessageEvent } from "./events/bot/message";
import { LuisCommandHandler } from "./handlers/luisCommandHandler";
import { CommandHandler } from "./handlers/commandHandler";
import { GuildMemberUpdateEvent } from "./events/bot/guildMemberUpdate";
import { MessageUpdateEvent } from "./events/bot/messageUpdate";

export class Bot implements IBot {
  public get commands(): BotCommand[] {
    return this._commands;
  }

  public get intents(): Intent[] {
    return this._intents;
  }

  public get logger() {
    return this._logger;
  }

  public get allUsers() {
    return this._client
      ? this._client.users.array().filter(i => i.id !== "1")
      : [];
  }

  public get onlineUsers() {
    return this.allUsers.filter(i => i.presence.status !== "offline");
  }

  private readonly _commands: BotCommand[] = [];
  private readonly _intents: Intent[] = [];
  private _client!: Client;
  private _config!: IBotConfig;
  private _logger!: ILogger;
  private _server!: Guild;

  public getServer() {
    return this._server;
  }

  public start(logger: ILogger, config: IBotConfig, dataPath: string) {
    this._logger = logger;
    this._config = config;
    this._server;

    LuisCommandHandler.setLuis(
      new Luis(this._config.luisAppId, this._config.luisApiKey)
    );

    // Load all commands
    CommandHandler.loadCommands(this, `${__dirname}/commands`, dataPath);

    //Load all intents
    LuisCommandHandler.loadIntents(`${__dirname}/intents`, dataPath);

    // Missing discord token
    if (!this._config.token) {
      throw new Error("invalid discord token");
    }

    // Create new instance of discord client
    this._client = new Client();

    let getClient = () => {
      return this._client;
    };

    // Automatically reconnect if the bot disconnects due to inactivity
    this._client.on("disconnect", function(erMsg, code) {
      DisconnectEvent.handle(getClient(), code, erMsg);
    });

    // Automatically reconnect if the bot errors
    this._client.on("error", function(error) {
      BotErrorEvent.handle(getClient(), error);
    });

    // On ready event from bot
    this._client.on("ready", () => {
      ReadyEvent.handle(this._logger, this._client, this._config);
    });

    // Fired when a user joins the server
    this._client.on("guildMemberAdd", async member => {
      GuildMemberAddEvent.handle(member);
    });

    // Fires when member leaves the server
    this._client.on("guildMemberRemove", async member => {
      GuildMemberRemoveEvent.handle(member);
    });

    // Fires every time a member says something in a channel
    this._client.on("message", async message => {
      MessageEvent.handle(message);
    });

    // Fires every time a member says something in a channel
    this._client.on("messageUpdate", async (oldMessage, newMessage) => {
      MessageUpdateEvent.handle(newMessage);
    });

    // Fires every time a member's role, name, icon, etc... updates
    this._client.on("guildMemberUpdate", function(oldMember, newMember) {
      GuildMemberUpdateEvent.handle(newMember, oldMember);
    });

    this._client.login(this._config.token);
  }

  private static dialogueUsers = new Array<InDialogue>();

  public static setIsInDialogue(
    channelId: string,
    userId: string,
    timestamp: Date
  ) {
    let ind = new InDialogue();

    ind.channelId = channelId;
    ind.userId = userId;
    ind.timestamp = timestamp;

    this.dialogueUsers.push(ind);
  }

  public static isInDialogue(channelId: string, userId: string) {
    let ind = this.dialogueUsers.find(
      x => x.userId == userId && x.channelId == channelId
    );
    return (
      ind != null &&
      new Date().getTime() - ind.timestamp.getTime() < 5 * 60 * 1000
    );
  }

  public static async removeIsInDialogue(channelId: string, userId: string) {
    return new Promise((resolve, reject) => {
      // Try to find in dialogue user
      let inDialogueUser = this.dialogueUsers.find(
        x => x.userId == userId && x.channelId == channelId
      );

      // Check if user is found
      if (inDialogueUser != null) {
        // Get index of user
        var index = this.dialogueUsers.indexOf(inDialogueUser);

        // Check if user is found
        if (index > -1) {
          // Remove user from list
          this.dialogueUsers.splice(index, 1);
        }

        // Reject the promise because we can't find the user
      } else return reject("");
    });
  }
}
