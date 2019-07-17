import * as Discord from "discord.js";
import * as API from "../api";
import * as ASPNET from "@aspnet/signalr";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Email } from "../models/email";
import { Ticket } from "../models/ticket/ticket";
import { Suggest } from "../models/suggest";
import { ChannelHandler } from "../handlers/channelHandler";
import {
  ProficiencyLevel,
  DiscordUserProficiency
} from "../models/proficiency/proficiency";
import { DiscordUser } from "../models/discordUser";
import { ConfigManager } from "../configManager";
import { TicketCreatedEvent } from "../events/shared/ticketCreated";
import { SuggestionEvent } from "../events/shared/suggestion";

(<any>global).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export class ApiBotService {
  private _serverBot: Discord.Client;
  private _config: API.IBotConfig;
  private _server: Discord.Guild;

  constructor(serverBot: Discord.Client, server: Discord.Guild) {
    this._serverBot = serverBot;
    this._server = server;

    this._config = ConfigManager.GetConfig();
  }

  startupService = async () => {
    // Creates connection to our API's SignalR hub
    const connection = new ASPNET.HubConnectionBuilder()
      .withUrl(this._config.apiUrl.replace("/api/", "") + "/discordbothub")
      .configureLogging(ASPNET.LogLevel.Debug)
      .build();

    // Start connection
    await connection
      .start()
      .then(console.log)
      .catch(err => console.error(err.toString()));

    // Auto reconnect
    connection.onclose(() => {
      setTimeout(function() {
        connection
          .start()
          .then(() => console.log("t"))
          .catch(err => console.error(err.toString()));
      }, 3000);
    });

    // On 'TicketCreated' -> fires when ticket is created through API
    connection.on("TicketCreated", async (ticket: Ticket) => {
      TicketCreatedEvent.handle(ticket, this._server);
    });

    // On 'TicketReaction' -> fires when ticket reaction has been added to an existing ticket
    connection.on("TicketReactionTest", async reaction => {
      console.log("newTicketReactionTest");
    });

    // On 'TicketReaction' -> fires when ticket reaction has been added to an existing ticket
    connection.on("TicketReaction", async reaction => {
      console.log("newTicketReaction");
    });

    // On 'Suggestion' -> fires when someone suggested something using the website
    connection.on("Suggestion", (suggestion: Suggest) => {
      SuggestionEvent.handle(this._server, this._serverBot, suggestion);
    });
  };
}
