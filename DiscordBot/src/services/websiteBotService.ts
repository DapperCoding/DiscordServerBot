import * as Discord from "discord.js";
import * as API from "../api";
import * as ASPNET from "@aspnet/signalr";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Email } from "../models/email";
import { Suggest } from "../models/suggest";
import { HostingEnquiry } from "../models/signalr/hostingEnquiry";
import { Application } from "../models/signalr/application";
import { TicketReaction } from "../models/ticket/ticketReaction";
import { Message } from "../models/message";
import TicketEmbed from "../models/ticket/ticketEmbed";
import { ChannelHandler } from "../handlers/channelHandler";
import {
  DiscordUserProficiency,
  ProficiencyLevel
} from "../models/proficiency/proficiency";
import { Ticket } from "../models/ticket/ticket";
import { DiscordUser } from "../models/discordUser";
import { ConfigManager } from "../configManager";
import { GuildHelper } from "../helpers/guildHelper";
import { NewOrderEvent } from "../events/website/newOrder";
import { AddTicketReactionEvent } from "../events/website/addTicketReaction";
import { AddTicketEvent } from "../events/website/addTicket";
import { TicketCreatedEvent } from "../events/shared/ticketCreated";
import { SuggestionUpdateEvent } from "../events/website/suggestionUpdate";
import { SuggestionEvent } from "../events/shared/suggestion";
import { FaqUpdateEvent } from "../events/website/faqUpdate";
import { ProductEnquiryEvent } from "../events/website/productEnquiry";
import { HostingEnquiryEvent } from "../events/website/hostingEnquiry";
import { AcceptedApplicantEvent } from "../events/website/acceptedApplicant";
import { ApplicationEvent } from "../events/website/application";
import { CloseTicketEvent } from "../events/website/closeTicket";
import { CloseTicketEmbedEvent } from "../events/website/closeTicketEmbed";
import { SendErrorEvent } from "../events/website/error";
import { CodeEvent } from "../events/website/code";
import { YtdlFixEvent } from "../events/website/ytdlFix";
import { DebuggerEvent } from "../events/website/debugger";
import { AcceptTicketEvent } from "../events/website/acceptTicket";

(<any>global).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export class WebsiteBotService {
  private _serverBot: Discord.Client;
  private _server: Discord.Guild;

  constructor(serverBot: Discord.Client, server: Discord.Guild) {
    this._serverBot = serverBot;
    this._server = server;
  }

  public GetServerPopulation() {
    // Return length of members array
    return this._server.members.array().length;
  }

  startupService = () => {
    // Creates connection to our website's SignalR hub
    const connection = new ASPNET.HubConnectionBuilder()
      .withUrl("https://dapperdino.co.uk/discordbothub")
      .configureLogging(ASPNET.LogLevel.Information)
      .build();

    // Starts connection
    connection
      .start()
      .then(() => console.log("t"))
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

    // On 'ReceiveMessage' -> test method
    connection.on("NewOrder", order => {
      NewOrderEvent.handle(this._server, order);
    });

    // On 'AddTicketReaction' -> test method
    connection.on("AddTicketReaction", unsentTicketReaction => {
      AddTicketReactionEvent.handle(
        this._server,
        this._serverBot,
        unsentTicketReaction
      );
    });

    // Add proficiency channel, send correct messages
    connection.on("AddTicket", (ticket: Ticket) => {
      AddTicketEvent.handle(this._server, ticket);
    });

    // On 'TicketCreated' -> fires when proficiency is created through API
    connection.on("TicketCreated", async (ticket: Ticket) => {
      TicketCreatedEvent.handle(ticket, this._server);
    });

    // On 'SuggestionUpdate' -> fires when suggestion is updated on the website
    connection.on("SuggestionUpdate", (suggestion: Suggest) => {
      SuggestionUpdateEvent.handle(this._serverBot, suggestion);
    });

    // On 'Suggestion' -> fires when someone suggested something using the website
    connection.on("Suggestion", (suggestion: Suggest) => {
      SuggestionEvent.handle(this._server, this._serverBot, suggestion);
    });

    // On 'FaqUpdate' -> fires when faq is updated on the website
    connection.on("FaqUpdate", async faq => {
      FaqUpdateEvent.handle(this._serverBot, faq);
    });

    connection.on("ProductEnquiry", productEnquiry => {
      ProductEnquiryEvent.handle(this._server, this._serverBot, productEnquiry);
    });

    connection.on("HostingEnquiry", (enquiry: HostingEnquiry) => {
      HostingEnquiryEvent.handle(this._server, enquiry);
    });

    connection.on("Application", (application: Application) => {
      ApplicationEvent.handle(this._server, application);
    });

    // On 'AcceptedApplicant'
    connection.on("AcceptedApplicant", async accepted => {
      AcceptedApplicantEvent.handle(this._server, accepted);
    });

    // ***** Ticket system actions

    // Close
    connection.on("CloseTicket", async (info: TicketEmbed) => {
      CloseTicketEvent.handle(info);
    });

    // Close embed
    connection.on("CloseTicketEmbed", async (info: TicketEmbed) => {
      CloseTicketEmbedEvent.handle(this._server, info);
    });

    // Error
    connection.on("Error", async (info: TicketEmbed) => {
      SendErrorEvent.handle(this._server, this._serverBot, info);
    });

    // Help
    connection.on("Code", async (info: TicketEmbed) => {
      CodeEvent.handle(this._server, this._serverBot, info);
    });

    // YtdlFix
    connection.on("YtdlFix", async (info: TicketEmbed) => {
      YtdlFixEvent.handle(this._server, info);
    });

    // Debugger
    connection.on("Debugger", async (info: TicketEmbed) => {
      DebuggerEvent.handle(this._server, info);
    });

    // Accept
    connection.on("AcceptTicket", async (info: TicketEmbed) => {
      AcceptTicketEvent.handle(this._server, info);
    });
  };
}
