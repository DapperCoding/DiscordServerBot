import * as discord from "discord.js";
import * as api from "../api";
import { compactDiscordUser } from "../models/compactDiscordUser";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import { email } from "../models/email";
import * as aspnet from "@aspnet/signalr";
import { faqMessage } from "../models/faq/faqMessage";
import { faqHandler } from "../handlers/faqHandler";
import { suggest } from "../models/suggest";
import { hostingEnquiry } from "../models/signalr/hostingEnquiry";
import { Application } from "../models/signalr/application";
import { ticketReaction } from "../models/ticket/ticketReaction";
import { message } from "../models/message";
import TicketEmbed from "../models/ticket/ticketEmbed";
import { channelhandler } from "../handlers/channelHandler";
import { ticket } from "../models/ticket/ticket";
import { discordUser } from "../models/discordUser";
import {
  proficiency,
  discordUserProficiency,
  proficiencyLevel
} from "../models/proficiency/proficiency";

(<any>global).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

export class websiteBotService {
  private _serverBot: discord.Client;
  private _config: api.IBotConfig;
  private _server: discord.Guild;

  constructor(
    serverBot: discord.Client,
    config: api.IBotConfig,
    server: discord.Guild
  ) {
    this._serverBot = serverBot;
    this._config = config;
    this._server = server;
  }

  startupService = () => {
    // Creates connection to our website's SignalR hub
    const connection = new aspnet.HubConnectionBuilder()
      .withUrl("https://dapperdino.co.uk/discordbothub")
      .configureLogging(aspnet.LogLevel.Information)
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
    connection.on("NewOrder", (order) => {
      let channel = this._server.channels.find(x=>x.name.toLowerCase() == "dapper-coding") as discord.TextChannel;

      if (channel) {
        channel.send(`New order with id ${order.id}`);
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

    // On 'AddTicketReaction' -> test method
    connection.on("AddTicketReaction", unsentTicketReaction => {
      // Get proficiency channel
      let channel = this._server.channels.find(
        c => c.name == `ticket${unsentTicketReaction.ticketId}`
      ) as discord.TextChannel;

      if (!channel) return true;

      let fromUser = this._server.members.get(unsentTicketReaction.discordId);

      if (!fromUser) return true;

      let reactionEmbed = new discord.RichEmbed()
        .setTitle(`Message from ${fromUser.user.username}`)
        .setDescription(unsentTicketReaction.message)
        .setThumbnail(
          fromUser.user.avatarURL
            ? fromUser.user.avatarURL
            : this._serverBot.user.avatarURL
        );

      // Send message if exists
      channel.send(reactionEmbed).then(msg => {
        let reaction = new ticketReaction();
        msg = msg as discord.Message;

        // Fill proficiency reaction model
        reaction.ticketId = unsentTicketReaction.ticketId;
        reaction.fromId = unsentTicketReaction.discordId; // use info from unsent
        reaction.username = unsentTicketReaction.username; // use info from unsent

        reaction.discordMessage = new message();

        reaction.discordMessage.message = unsentTicketReaction.message;
        reaction.discordMessage.messageId = msg.id;
        reaction.discordMessage.timestamp = new Date(msg.createdTimestamp);
        reaction.discordMessage.guildId = msg.guild.id;
        reaction.discordMessage.channelId = msg.channel.id;
        reaction.discordMessage.isEmbed = false;
        reaction.discordMessage.isDm = false;

        // Request API and add our reaction to the database.
        new apiRequestHandler()
          .requestAPIWithType<any>(
            "POST",
            reaction,
            "https://api.dapperdino.co.uk/api/ticket/reaction",
            this._config
          )
          .then(console.log)
          .catch(console.error);
      });
    });

    // Add proficiency channel, send correct messages
    connection.on("AddTicket", (ticket: ticket) => {
      // Create new channel handler
      let handler = new channelhandler(this._server);

      // Get applicant as memebr
      let user = this._server.members.find(
        member => member.user.id === ticket.applicant.discordId
      );

      // Check if proficiency channel doesn't already exist
      if (
        !this._server.channels.find(
          channel => channel.name === `ticket-${ticket.id}`
        )
      ) {
        // Create proficiency channel
        handler.createChannelTicketCommand(ticket.id, user);
      }
    });

    // On 'TicketCreated' -> fires when proficiency is created through API
    connection.on("TicketCreated", async (ticket: ticket) => {
      console.log("hi");
      // Get all members with happy to help (h2h) role
      let happyToHelpers = this.GetAllWithRole("Happy To Help");

      // Loop over all h2h-ers
      for (let i = 0; i < happyToHelpers.length; i++) {
        // Get information for discord user
        new apiRequestHandler()
          .requestAPIWithType<discordUserProficiency[]>(
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
                      proficiencyLevel.absoluteBeginner &&
                    proficiency.proficiencyLevel != proficiencyLevel.justStarted
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
                let ticketEmbed = new discord.RichEmbed()
                  .setTitle("Ticket: " + ticket.subject + ", has been created")
                  .setDescription(
                    ticket.applicant.username + " is in need of help!"
                  )
                  .setColor("#ffdd05")
                  .addField("Their description:", ticket.description)
                  .addField(
                    "Thank you ",
                    happyToHelpers[i].displayName +
                      " for being willing to assist others in our server."
                  )
                  .addField("Language", ticket.language.name)
                  .addField("Framework", ticket.framework.name)
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

      //Create embed for helpers to know that the proficiency is closed
      let acceptTicketEmbed = new discord.RichEmbed()
        .setTitle("Ticket: " + ticket.subject + ", has been created")
        .setColor("#2dff2d")
        .addField("Their description:", ticket.description)
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
      ) as discord.TextChannel;

      if (!ticketsToAcceptChannel) return "Channel not found";

      //Send the embed to the tickets to accept channel
      ticketsToAcceptChannel.send(acceptTicketEmbed);
    });

    // On 'SuggestionUpdate' -> fires when suggestion is updated on the website
    connection.on("SuggestionUpdate", (suggestion: suggest) => {
      // Get user that suggested this suggestion
      let suggestor = this._serverBot.users.get(
        suggestion.discordUser.discordId
      );

      // Check if found
      if (suggestor) {
        // Create suggestion embed
        let suggestionUpdateEmbed = new discord.RichEmbed({})
          .setTitle("Your suggestion has been updated!")
          .setColor("0xff0000")
          .addField(
            "Here you will find the information about your updated suggestion:",
            `https://dapperdino.co.uk/Client/Suggestion/${suggestion.id}`
          )
          .addField("Suggestion description:", suggestion.description)
          .addField("Suggestion Type:", suggestionTypeText(suggestion.type))
          .addField(
            "Suggestion Status:",
            suggestionStatusText(suggestion.status)
          )
          .addField(
            "Thanks as always for being a part of the community.",
            "It means a lot!"
          )
          .setFooter("With ❤ By the DapperCoding team");

        // Send embed to suggestor
        suggestor.send(suggestionUpdateEmbed).catch(console.error);
      }

      return true;
    });

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

    // On 'Suggestion' -> fires when someone suggested something using the website
    connection.on("Suggestion", (suggestion: suggest) => {
      // Get user that suggested this suggestion
      const suggestor = this._serverBot.users.get(
        suggestion.discordUser.discordId
      );

      // Create suggestion embed
      const suggestionEmbed = new discord.RichEmbed({})
        .setTitle("Your suggestion has been created!")
        .setColor("0xff0000")
        .addField(
          "Here you will find the information about your suggestion:",
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

        const h2hChat = this._server.channels.find(
          channel => channel.name.toLowerCase() === "dapper-team"
        ) as discord.TextChannel;

        h2hChat.send(suggestionEmbed);
      }

      return true;
    });

    // On 'FaqUpdate' -> fires when faq is updated on the website
    connection.on("FaqUpdate", async faq => {
      // Get FAQ channel
      let faqChannel = this._serverBot.channels.get("461486560383336458");

      // If FAQ channel is found
      if (faqChannel) {
        // Get as text channel
        let channel = faqChannel as discord.TextChannel;

        // Try to find discordMessage with id of updated faq item
        let message = await channel.fetchMessage(faq.discordMessage.messageId);

        // Create faq embed
        let faqEmbed = new discord.RichEmbed()
          .setTitle("-Q: " + faq.question)
          .setDescription("-A: " + faq.answer)
          .setColor("#2dff2d");

        // Check if resource link is present
        if (faq.resourceLink != null) {
          // Add resource link to faq embed
          faqEmbed.addField(
            "Useful Resource: ",
            `[${faq.resourceLink.displayName}](${faq.resourceLink.link})`
          );
        }

        // Try to delete discordMessage, then add the updated version
        message
          .edit(faqEmbed)
          .then(console.log)
          .catch(console.error);

        return true;
      }
    });

    connection.on("ProductEnquiry", productEnquiry => {
      let dapperCodingTeam = this.GetAllWithRole("dappercoding");
      let enquiryEmbed = new discord.RichEmbed()
        .setTitle(
          `A user has requested contact regarding the ${productEnquiry.product}`
        )
        .setColor("0x00ff00")
        .addField("The user", productEnquiry.discordId)
        .setFooter("Please DM this user asap - or DM Mick");

      try {
        dapperCodingTeam.forEach(member => {
          member.send(enquiryEmbed);
        });
      } catch (e) {
        console.error(e);
      }

      let testUser = this._serverBot.users.find(
        user => user.tag == productEnquiry.discordId
      );
      if (testUser) {
        try {
          let productEnquiryEmbed = new discord.RichEmbed()
            .setTitle("Thanks for your requesting contact!")
            .setColor("0xff0000")
            .addField(
              "Information",
              `You'll receive more information about ${productEnquiry.product}`
            )
            .setFooter("With ❤ by the DapperCoding team");
          testUser.send(productEnquiryEmbed).catch(console.error);
        } catch (e) {}
      }
      return true;
    });

    connection.on("HostingEnquiry", (enquiry: hostingEnquiry) => {
      const channel = this._server.channels.find(
        channel => channel.name.toLowerCase() === "dapper-coding"
      ) as discord.TextChannel;
      const discordUser = this._server.members.get(enquiry.discordId);

      if (channel == null) return true;

      let dapperCodingTeam = this.GetAllWithRole("dappercoding");
      let hostingEmbed = new discord.RichEmbed()
        .setTitle(
          `A user has requested contact regarding the hosting ${
            enquiry.packageType
          }`
        )
        .setColor("0x00ff00")
        .setFooter("Please dm this user asap - or dm Mick");

      if (discordUser) {
        hostingEmbed.addField("The user", discordUser.user.username);
      } else {
        hostingEmbed.addField("The user", enquiry.discordId);
      }

      channel.send(hostingEmbed);

      try {
        dapperCodingTeam.forEach(member => {
          member.send(hostingEmbed);
        });
      } catch (e) {
        console.error(e);
      }

      if (discordUser) {
        try {
          let hostingEnquiryEmbed = new discord.RichEmbed()
            .setTitle(
              "Thanks for taking interest in one of our hosting packages!"
            )
            .setDescription("We usually contact you within 24 hours!")
            .setColor("0xff0000")
            .addField(
              "Information",
              `You'll receive more information about hosting package: ${
                enquiry.package
              }, soon.`
            )
            .setFooter("With ❤ by the DapperCoding team");
          discordUser.send(hostingEnquiryEmbed).catch(console.error);
        } catch (e) {}
      }
      return true;
    });

    connection.on("Application", (application: Application) => {
      const channel = this._server.channels.find(
        channel => channel.name.toLowerCase() === "dapper-coding"
      ) as discord.TextChannel;
      const dapperCodingTeam = this.GetAllWithRole("dappercoding");
      const discordUser = this._server.members.get(application.discordId);
      const applicationEmbed = new discord.RichEmbed()
        .setTitle(`A user has applied for the happy to help role`)
        .addField("First name", application.firstName)
        .addField("Last name", application.lastName)
        .addField("Explanation", application.explanation)
        .addField("Links", application.links)
        .setColor("0x00ff00")
        .setFooter("Please dm this user asap - or dm Mick");
      if (discordUser) {
        applicationEmbed.addField("The user", discordUser.user.username);
      } else {
        applicationEmbed.addField("The user", application.discordId);
      }

      if (channel) {
        channel.send(applicationEmbed);
      }

      try {
        dapperCodingTeam.forEach(member => {
          member.send(applicationEmbed);
        });
      } catch (e) {
        console.error(e);
      }

      if (discordUser) {
        try {
          let appliedEmbed = new discord.RichEmbed()
            .setTitle("Thanks for your application!")
            .setColor("0xff0000")
            .addField(
              "Information",
              `You'll receive more information about the application soon.`
            )
            .setFooter("With ❤ by the DapperCoding team");
          discordUser.send(appliedEmbed).catch(console.error);
        } catch (e) {}
      }
      return true;
    });

    // On 'AcceptedApplicant' -> when admin accepts a h2h member through the admin panel
    connection.on("AcceptedApplicant", async accepted => {
      let member = this._server.members.find(
        member => member.user.id == accepted.discordId
      );
      if (member == null) return true;

      let role = this._server.roles.find(
        role => role.name.toLowerCase() == "happy to help"
      );
      if (role == null) return true;

      member.addRole(role).catch(console.error);
      member.send(
        "Please use the `?commands` command in the #h2h-admin-commands"
      );

      let channel = this._server.channels.find(
        channel => channel.name.toLowerCase() == "dapper-team"
      ) as discord.TextChannel;
      if (channel == null) return false;

      channel
        .send(`Please welcome ${member.user.username} to the team!`)
        .catch(console.error);

      return true;
    });

    // ***** Ticket system actions

    // Close
    connection.on("CloseTicket", async (info: TicketEmbed) => {
      let information = info as TicketEmbed;
      let channel = this.GetChannel(`ticket${info.ticket.id}`);

      if (channel) {
        channel.delete("Closed through ticket portal (web)");
      }

      let completedTicketEmbed = new discord.RichEmbed()
        .setTitle(`Ticket ${information.ticket.id} has been completed!`)
        .setColor("#ff0000")
        .setDescription(
          `${
            information.ticket.applicant.username
          }'s problem has now been resolved, good job`
        );

      // Get completed tickets channel
      let completedTicketsChannel = this.GetChannel(
        "completed-tickets"
      ) as discord.TextChannel;

      if (!completedTicketsChannel) return "Channel not found";

      //Send the embed to completed tickets channel
      completedTicketsChannel.send(completedTicketEmbed);
    });

    // Close embed
    connection.on("CloseTicketEmbed", async (info: TicketEmbed) => {
      let channel = this.GetChannel(
        `ticket${info.ticket.id}`
      ) as discord.TextChannel;

      if (!channel) {
        return true;
      }

      let user = this._server.members.get(info.user.discordId);

      if (!user) {
        return true;
      }

      // Create embed that tells the creator to close the proficiency
      let endTicketEmbed = new discord.RichEmbed()
        .setTitle(
          `${info.user.username} thinks that this ticket can be closed now`
        )
        .setThumbnail(user.user.avatarURL)
        .setColor("#2dff2d")
        .setDescription(
          "If you agree that this ticket should be closed then please type the following command:\n__**?closeTicket**__"
        );

      channel.send(endTicketEmbed);
    });

    // Error
    connection.on("Error", async (info: TicketEmbed) => {
      let channel = this.GetChannel(
        `ticket${info.ticket.id}`
      ) as discord.TextChannel;

      if (!channel) {
        return true;
      }

      let user = this._server.members.get(info.user.discordId);

      if (!user) {
        return true;
      }

      let applicant = this._server.members.get(info.ticket.applicant.discordId);

      if (!applicant) {
        return true;
      }

      // Create embed that tells the creator to send their errors
      let errorEmbed = new discord.RichEmbed()
        .setColor("#ff0000")
        .setTitle(`Please send us your errors`)
        .setDescription(`${user.user.username} asks you to send your errors`)
        .addField(
          "Screenshot",
          "Please send us a screenshot of your error too",
          false
        )
        .addField("Notification", `${applicant.user}`, false)
        .setFooter("Thanks in advance!");

      errorEmbed.setThumbnail(
        user.user.avatarURL
          ? user.user.avatarURL
          : this._serverBot.user.avatarURL
      );

      channel.send(errorEmbed);
    });

    // Help
    connection.on("Code", async (info: TicketEmbed) => {
      let channel = this.GetChannel(
        `ticket${info.ticket.id}`
      ) as discord.TextChannel;

      if (!channel) {
        return true;
      }

      let user = this._server.members.get(info.user.discordId);

      if (!user) {
        return true;
      }

      let applicant = this._server.members.get(info.ticket.applicant.discordId);

      if (!applicant) {
        return true;
      }

      // Create embed that tells the creator to send their errors
      let errorEmbed = new discord.RichEmbed()
        .setColor("#00ff00")
        .setTitle(`Please send us your code`)
        .setDescription(`${user.user.username} asks you to send your code`)
        .addField(
          "As text",
          "Please send your code using codeblocks or sites like hastebin.",
          false
        )
        .addField("Notification", `${applicant.user}`, false)
        .setFooter("Thanks in advance!");

      errorEmbed.setThumbnail(
        user.user.avatarURL
          ? user.user.avatarURL
          : this._serverBot.user.avatarURL
      );

      channel.send(errorEmbed);
    });

    // YtdlFix
    connection.on("YtdlFix", async (info: TicketEmbed) => {
      let channel = this.GetChannel(
        `ticket${info.ticket.id}`
      ) as discord.TextChannel;

      if (!channel) {
        return true;
      }

      let user = this._server.members.get(info.user.discordId);

      if (!user) {
        return true;
      }
      let url = "https://dapperdino.co.uk/ytdl-fix.zip";

      // Create embed that tells the creator to close the proficiency
      let ytdlfixEmbed = new discord.RichEmbed()
        .setColor("#ff0000")
        .setTitle("The YTDL Fix")
        .setURL(url)
        .addField(
          "Please download the zip file " +
            info.ticket.applicant.username +
            ".",
          info.user.username +
            " asks you to download the zip file and extract the files to your node_modules folder (overwrite files)."
        )
        .addField(
          "Video explanation:",
          "https://www.youtube.com/watch?v=MsMYrxyYNZc"
        )
        .setFooter(
          "If you keep experiencing errors, feel free to ask your question in a ticket."
        );

      channel.send(ytdlfixEmbed);
      return true;
    });

    // Debugger
    connection.on("Debugger", async (info: TicketEmbed) => {
      let channel = this.GetChannel(
        `ticket${info.ticket.id}`
      ) as discord.TextChannel;

      if (!channel) {
        return true;
      }

      let user = this._server.members.get(info.user.discordId);

      if (!user) {
        return true;
      }

      // Create embed that tells the creator to close the proficiency
      let endTicketEmbed = new discord.RichEmbed()
        .setColor("#ff0000")
        .setTitle(`Hey ${info.ticket.applicant.username} - just a tip`)
        .setDescription(
          "We think you should use a debugging tool, you can find a video about how to use them just below."
        )
        .addField(
          "documentation:",
          "https://code.visualstudio.com/docs/nodejs/nodejs-debugging"
        )
        .addField("video:", "https://www.youtube.com/watch?v=2oFKNL7vYV8")
        .setFooter("Thanks in advance!");

      channel.send(endTicketEmbed);
    });

    // Accept
    connection.on("AcceptTicket", async (info: TicketEmbed) => {
      // console.log(info);
      let channel = this.GetChannel(
        `ticket${info.ticket.id}`
      ) as discord.TextChannel;

      if (!channel) {
        return true;
      }

      let user = this._server.members.get(info.user.discordId);

      if (!user) {
        return true;
      }

      // Add premissions to channel for h2h-er
      channel.overwritePermissions(user, {
        READ_MESSAGE_HISTORY: true,
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        EMBED_LINKS: true
      });

      let acceptedTicketembed = new discord.RichEmbed()
        .setTitle(`${info.user.username} is here to help you!`)
        .setThumbnail(user.user.avatarURL)
        .setColor("#2dff2d")
        .setDescription(
          "Please treat them nicely and they will treat you nicely back :)"
        );

      (channel as discord.TextChannel).send(acceptedTicketembed);

      //Create embed for helpers to know that the proficiency is closed
      let inProgressEmbed = new discord.RichEmbed()
        .setTitle(
          `Ticket ${info.ticket.id} has been accepted by ${user.displayName}!`
        )
        .setColor("#ffdd05")
        .setDescription(`Thank you for your time and efforts :)`);

      //If the user has a profile pic we will set it in the embed
      if (user.user.avatarURL != null) {
        inProgressEmbed.setThumbnail(user.user.avatarURL);
      }

      // Get completed tickets channel
      let inProgressChannel = this._server.channels.find(
        channel => channel.name === "tickets-in-progress"
      ) as discord.TextChannel;

      if (!inProgressChannel) return "Channel not found";

      //Send the embed to completed tickets channel
      inProgressChannel.send(inProgressEmbed);
    });
  };

  public GetAllWithRole(requestedRole: string) {
    //Get all members in the server
    let allUsers = this._server.members.array();

    //Create an array to story all the members with the requested role
    let usersWithRole = new Array<discord.GuildMember>();

    //Loop through all the members in the server
    for (let i = 0; i < allUsers.length; i++) {
      //Check if any of their roles has the same name as the requested role
      if (
        allUsers[i].roles.find(
          role => role.name.toLowerCase() === requestedRole.toLowerCase()
        )
      ) {
        //Add that member to the list
        usersWithRole.push(allUsers[i]);
      }
    }

    //Return all the members that have the role
    return usersWithRole;
  }

  private GetChannel(name: string) {
    return this._server.channels.find(x => x.name == name);
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
    let userObject = new compactDiscordUser();

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
    let userObject = new compactDiscordUser();

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
    let emailObject = new email();

    // Add email address to it
    emailObject.email = emailAddress;

    // Get response from api
    let responseData = new apiRequestHandler().requestAPI(
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
