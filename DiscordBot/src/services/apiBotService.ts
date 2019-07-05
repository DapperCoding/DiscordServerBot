import * as Discord from "discord.js";
import * as API from "../api";
import * as ASPNET from "@aspnet/signalr";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Email } from "../models/email";
import { Ticket } from "../models/ticket/ticket";
import { Suggest } from "../models/suggest";
import { ChannelHandler } from "../handlers/channelHandler";
import {ProficiencyLevel,DiscordUserProficiency} from "../models/proficiency/proficiency";
import { DiscordUser } from "../models/discordUser";

(<any>global).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export class ApiBotService {
  private _serverBot: Discord.Client;
  private _config: API.IBotConfig;
  private _server: Discord.Guild;

  constructor(
    serverBot: Discord.Client,
    config: API.IBotConfig,
    server: Discord.Guild
  ) {
    this._serverBot = serverBot;
    this._config = config;
    this._server = server;
  }

  startupService = async () => {
    // Creates connection to our API's SignalR hub
    const connection = new ASPNET.HubConnectionBuilder()
      .withUrl("https://api.dapperdino.co.uk//discordbothub")
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
      let member = this._server.members.get(ticket.applicant.discordId);
      if (!member) return;
      // Create new channelHandler
      new ChannelHandler(this._server)

        // Add author to ticket
        .createChannelTicketCommand(ticket.id, member)
        .then(async channel => {
          let chan = channel as Discord.TextChannel;

          if (chan && member) {
            chan.setTopic(
              `This ticket is created by ${
                member.user.username
              } \n\n\n Subject:\n${ticket.subject} \n\n Description:\n${
                ticket.description
              }`
            );
          }
        });

      console.log("hi");
      // Get all members with happy to help (h2h) role
      let happyToHelpers = this.GetAllWithRole("Happy To Help");
      // Loop over all h2h-ers
      for (let i = 0; i < happyToHelpers.length; i++) {
        // Get information for discord user
        new ApiRequestHandler()
          .requestAPIWithType<DiscordUserProficiency[]>(
            "GET",
            null,
            "https://api.dapperdino.co.uk/api/proficiency/GetProficienciesForDiscordUser/" +
              happyToHelpers[i].user.id,
            this._config
          )
          .then(proficiencies => {
            let isInLanguage = false;
            let isInFramework = false;
            if (!proficiencies || proficiencies.length <= 0) {
              isInLanguage = true;
              isInFramework = true;
            } else {
              if (!ticket.language) isInLanguage = true;
              if (!ticket.framework) isInFramework = true;

              if (!isInLanguage && !isInFramework) {
                for (
                  let proficiencyIndex = 0;
                  proficiencyIndex < proficiencies.length;
                  proficiencyIndex++
                ) {
                  let proficiency = proficiencies[proficiencyIndex];

                  if (
                    proficiency.proficiencyLevel !=
                      ProficiencyLevel.AbsoluteBeginner &&
                    proficiency.proficiencyLevel != ProficiencyLevel.JustStarted
                  ) {
                    if (ticket.language.id == proficiency.proficiencyId) {
                      isInLanguage = true;
                    } else if (
                      ticket.framework.id == proficiency.proficiencyId
                    ) {
                      isInFramework = true;
                    }
                  }
                }
              }

              if (isInFramework || isInLanguage) {
                // Create proficiency embed
                let ticketEmbed = new Discord.RichEmbed()
                  .setTitle("Ticket: " + ticket.subject + ", has been created")
                  .setDescription(
                    ticket.applicant.username + " is in need of help!"
                  )
                  .setColor("#ffdd05")
                  .addField("Language", ticket.language.name)
                  .addField("Framework", ticket.framework.name)
                  .addField("Their description:", ticket.description)
                  .addField(
                    "Thank you ",
                    happyToHelpers[i].displayName +
                      " for being willing to assist others in our server."
                  )
                  .addField(
                    "Ticket Portal V0.1",
                    `To read all messages sent in this ticket, click on the title of this embed to open the ticket in the Ticket Portal.`
                  )
                  .addField(
                    "If you would like to help with this request then please type:",
                    "?acceptTicket " + ticket.id
                  )
                  .setURL(
                    `https://dapperdino.co.uk/HappyToHelp/Ticket?id=${
                      ticket.id
                    }`
                  )
                  .setFooter("Thanks for all your help :)");

                // Send proficiency embed to h2h-er
                happyToHelpers[i].send(ticketEmbed).catch(console.error);
              }
            }
          });
      }
      // Get current guild
      let guild = this._serverBot.guilds.get(this._config.serverId);

      if (!guild) return "Server not found";

      //Create embed for helpers to know that the ticket is closed
      let completedTicketEmbed = new Discord.RichEmbed()
        .setTitle("Ticket: " + ticket.subject + ", has been created")
        .setColor("#2dff2d")
        .addField("Language", ticket.language.name)
        .addField("Framework", ticket.framework.name)
        .addField("Their description", ticket.description)
        .addField(
          "Ticket Portal V0.1",
          `To read all messages sent in this ticket, click on the title of this embed to open the ticket in the Ticket Portal.`
        )
        .addField(
          "If you would like to help with this request then please type:",
          "?acceptTicket " + ticket.id
        )
        .setURL(`https://dapperdino.co.uk/HappyToHelp/Ticket?id=${ticket.id}`)
        .setFooter("Thanks for all your help :)");

      // Get tickets to accept channel
      let ticketsToAcceptChannel = guild.channels.find(
        channel => channel.name === "tickets-to-accept"
      ) as Discord.TextChannel;

      if (!ticketsToAcceptChannel) return "Channel not found";

      //Send the embed to the tickets to accept channel
      ticketsToAcceptChannel.send(completedTicketEmbed);
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
      // Get user that suggested this suggestion
      const suggestor = this._serverBot.users.get(
        suggestion.discordUser.discordId
      );

      let suggestionTypeText = (type: number) => {
        switch (type) {
          case 0:
            return "Bot";
          case 1:
            return "Website";
          case 2:
            return "General";
          case 3:
            return "YouTube";
          case 4:
            return "Undecided";
          default:
            return "Undecided";
        }
      };

      let suggestionStatusText = (type: number) => {
        switch (type) {
          case 0:
            return "Abandoned";
          case 1:
            return "WorkInProgress";
          case 2:
            return "InConsideration";
          case 3:
            return "Completed";
          case 4:
            return "Future";
          default:
            return "NotLookedAt";
        }
      };

      // Create suggestion embed
      const suggestionEmbed = new Discord.RichEmbed({})
        .setTitle("Your suggestion has been created!")
        .setColor("0xff0000")
        .addField(
          "Here you will find the information about the suggestion:",
          `https://dapperdino.co.uk/Client/Suggestion/${suggestion.id}`
        )
        .addField("Suggestion description:", suggestion.description)
        .addField("Suggestion Type:", suggestionTypeText(suggestion.type))
        .addField("Suggestion Status:", suggestionStatusText(suggestion.status))
        .addField(
          "Thanks as always for being a part of the community.",
          "It means a lot!"
        )
        .setFooter("With ❤ the DapperCoding team");
      // Check if found
      if (suggestor) {
        // Send embed to suggestor
        suggestor.send(suggestionEmbed).catch(console.error);

        suggestionEmbed.setTitle(`${suggestor.username} suggested something.`);
        suggestionEmbed.setDescription(
          `Happy To Help link: https://dapperdino.co.uk/HappyToHelp/Suggestion/${
            suggestion.id
          }`
        );
        const h2hChat = this._server.channels.find(
          channel => channel.name.toLowerCase() === "dapper-team"
        ) as Discord.TextChannel;

        h2hChat.send(suggestionEmbed);
      }
    });

    // On 'ReceiveMessage' -> test method
    connection.on("ReceiveMessage", (user, message) => {
      let testUser = this._serverBot.users.get(
        this.GetDiscordUserByUsername(user).discordId
      );
      if (testUser) {
        testUser.send(message).catch(console.error);
      }
    });
  };

  public GetAllWithRole(requestedRole: string) {
    //Get all members in the server
    let allUsers = this._server.members.array();

    //Create an array to story all the members with the requested role
    let usersWithRole = new Array<Discord.GuildMember>();

    //Loop through all the members in the server
    for (let i = 0; i < allUsers.length; i++) {
      //Check if any of their roles has the same name as the requested role
      if (allUsers[i].roles.find(role => role.name === requestedRole)) {
        //Add that member to the list
        usersWithRole.push(allUsers[i]);
      }
    }

    //Return all the members that have the role
    return usersWithRole;
  }

  // Get server population
  public GetServerPopulation() {
    // Return length of members array
    return this._server.members.array().length;
  }

  // Get discord user by username
  public GetDiscordUserByUsername(username: string) {
    // Try to find user by username
    let user = this._serverBot.users.find(user => user.username === username);

    // Create compact discord user
    let userObject = new DiscordUser();

    // Doesn't fill if user couldn't be found
    if (user != null) {
      // Fills userObject if user is found
      userObject.username = user.username;
      userObject.discordId = user.id;
    }

    // Returns compact discord user that's either empty or filled with the information gotten from the server
    return userObject;
  }

  // Get discord user by id
  public GetDiscordUserById(id: string) {
    // Try to find user by id
    let user = this._serverBot.users.find(user => user.id === id);

    // Create compact discord user
    let userObject = new DiscordUser();

    // Doesn't fill if user couldn't be found
    if (user != null) {
      // Fills userObject if user is found
      userObject.username = user.username;
      userObject.discordId = user.id;
    }

    // Returns compact discord user that's either empty or filled with the information gotten from the server
    return userObject;
  }

  // Get discord user by email from API
  public GetDiscordUserByEmail(emailAddress: string) {
    // Create new Email object
    let emailObject = new Email();

    // Add email address to it
    emailObject.email = emailAddress;

    // Get response from api
    let responseData = new ApiRequestHandler().requestAPI(
      "POST",
      emailObject,
      "https://dapperdinoapi.azurewebsites.net/api/search/user",
      this._config
    );

    // Try to log data
    console.log(responseData);

    /// THIS METHOD NEEDS TO BE REFACTORED
  }
}
