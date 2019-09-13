import * as Discord from "discord.js";

export class ChannelHandler {
  private _guild: Discord.Guild;

  constructor(guild: Discord.Guild) {
    this._guild = guild;
  }

  /**
   * name: createChannelTicketCommand
   * description: Creates a ticket channel based on the ticket command
   * params:
   * - messageHandler: Function that's fired on each discordMessage
   * - discordMessage: Message by creator
   * - ticketId: Ticket id gotten from POST to API
   */
  public async createChannelTicketCommand(
    ticketId: number,
    member: Discord.GuildMember
  ) {
    // Return new promise, contains the discord channel if it's resolved
    return new Promise<Discord.Channel>(async (resolve, reject) => {
      //Find the role 'Admin'
      var adminRole = this._guild.roles.find(role => role.name === "Admin");

      //Find the role 'Dapper Bot'
      var dapperRole = this._guild.roles.find(
        role => role.name === "Dapper Bot"
      );

      //Find the role 'DapperWeb'
      var dapperWebRole = this._guild.roles.find(
        role => role.name === "DapperWeb"
      );

      // Find category 'Tickets'
      var category = this._guild.channels.find(
        role => role.name === "Tickets"
      ) as Discord.CategoryChannel;

      // Add category if not existing
      if (!category)
        await this._guild
          .createChannel("Tickets", "category")
          .then(p => (category = p as Discord.CategoryChannel));

      // Create channel for ticket
      return await this._guild
        .createChannel(`ticket${ticketId}`, "text", [
          {
            id: this._guild.id,
            allow: [],
            deny: ["READ_MESSAGE_HISTORY", "SEND_MESSAGES", "VIEW_CHANNEL"]
          }
        ])

        // If ticket channel is created
        .then(async channel => {
          // Set parent to the category channel
          await channel.setParent(category);

          // Add permissions for creator
          channel.overwritePermissions(member, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Add permissions for admins
          channel.overwritePermissions(adminRole, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Add permissions for dapper bot
          channel.overwritePermissions(dapperRole, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Add permissions for dapper bot
          channel.overwritePermissions(dapperWebRole, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Remove permissions for everyone else
          channel.overwritePermissions(this._guild.id, {
            READ_MESSAGE_HISTORY: false,
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false
          });

          let ticketChannelEmbed = new Discord.RichEmbed()
            .setTitle(
              `Hello ${member.user.username}, welcome to our Ticket managing service!`
            )
            .setThumbnail("https://dapperdino.co.uk/images/dapperbot.png")
            .setDescription(
              "We have received your ticket and have notified all Happy-To-Help members."
            )
            .setColor("#2dff2d")
            .addField(
              "Information",
              "Please provide us with as much information as possible. Send at least your code and the error or a screenshot of your entire vscode window."
            )
            .addField(
              "Please be patient whilst waiting for a helper to respond.",
              "Once you have finished your discussion and your question has been answered please use the command:\n__**?closeTicket**__"
            )
            .addField(
              "When your ticket is accepted you will be notified here",
              "Just remember to be patient and well mannered as these members are giving up their own time to help you"
            )
            .setFooter(
              "In the meantime you can start explaining your problems here as the Happy-To-Help member will be able to read all messages in the channel when they join"
            );

          (channel as Discord.TextChannel).send(ticketChannelEmbed);

          return resolve(channel);
        })

        // Catch errors for creating channel
        .catch(err => {
          // Log and reject
          console.error(err);
          return reject(err);
        });
    });
  }

  /**
   * name: addPermissionsToChannelTicketCommand
   * description: add permissions for this channel to the h2h-er that used ?acceptTicket {ticketId}
   * params:
   * - ticketId = ticket id got from api/signalR
   * - discordMessage = h2h-er accept discordMessage
   */
  public async addPermissionsToChannelTicketCommand(
    ticketId: number,
    message: Discord.Message,
    embed: Discord.RichEmbed
  ) {
    // Find channel based on ticketId
    var channel = this._guild.channels.find(
      channel => channel.name === `ticket${ticketId}`
    );

    // If channel is found
    if (channel) {
      // Add premissions to channel for h2h-er
      channel.overwritePermissions(message.author, {
        READ_MESSAGE_HISTORY: true,
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        EMBED_LINKS: true
      });

      (channel as Discord.TextChannel).send(embed);

      //Create embed for helpers to know that the ticket is closed
      let inProgressEmbed = new Discord.RichEmbed()
        .setTitle(
          `Ticket ${ticketId} has been accepted by ${message.member.displayName}!`
        )
        .setColor("#ffdd05")
        .setDescription(`Thank you for your time and efforts :)`);

      //If the user has a profile pic we will set it in the embed
      if (message.author.avatarURL != null) {
        inProgressEmbed.setThumbnail(message.author.avatarURL);
      }

      // Get completed tickets channel
      let inProgressChannel = this._guild.channels.find(
        channel => channel.name === "tickets-in-progress"
      ) as Discord.TextChannel;

      if (!inProgressChannel) return "Channel not found";

      //Send the embed to completed tickets channel
      inProgressChannel.send(inProgressEmbed);
    }
  }

  public async createChannelForInterview(
    interviewType: string,
    formId: number,
    applicant: Discord.GuildMember,
    recruiter: Discord.GuildMember
  ) {
    // Return new promise, contains the discord channel if it's resolved
    return new Promise<Discord.Channel>(async (resolve, reject) => {
      //Find the role 'Admin'
      var adminRole = this._guild.roles.find(role => role.name === "Admin");

      //Find the role 'Dapper Bot'
      var dapperRole = this._guild.roles.find(
        role => role.name === "Dapper Bot"
      );

      //Find the role 'DapperWeb'
      var dapperWebRole = this._guild.roles.find(
        role => role.name === "DapperWeb"
      );

      // Find category 'Tickets'
      var category = this._guild.channels.find(
        role => role.name === "interviews"
      ) as Discord.CategoryChannel;

      // Add category if not existing
      if (!category)
        await this._guild
          .createChannel("interviews", "category")
          .then(p => (category = p as Discord.CategoryChannel));

      // Create channel for ticket
      return await this._guild
        .createChannel(`${interviewType}-${formId}`, "text", [
          {
            id: this._guild.id,
            allow: [],
            deny: ["READ_MESSAGE_HISTORY", "SEND_MESSAGES", "VIEW_CHANNEL"]
          }
        ])

        // If ticket channel is created
        .then(async channel => {
          // Set parent to the category channel
          await channel.setParent(category);

          // Add permissions for creator
          channel.overwritePermissions(applicant, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Add permissions for recruiter
          channel.overwritePermissions(recruiter, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Add permissions for admins
          channel.overwritePermissions(adminRole, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Add permissions for dapper bot
          channel.overwritePermissions(dapperRole, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Add permissions for dapper bot
          channel.overwritePermissions(dapperWebRole, {
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            EMBED_LINKS: true
          });

          // Remove permissions for everyone else
          channel.overwritePermissions(this._guild.id, {
            READ_MESSAGE_HISTORY: false,
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false
          });

          let ticketChannelEmbed = new Discord.RichEmbed()
            .setTitle(
              `Hello ${applicant.user.username}, let's find out if you're a match for our team!`
            )
            .setThumbnail("https://dapperdino.co.uk/images/dapperbot.png")
            .setDescription(
              `We have received your application and ${recruiter.user.username} will interview you!.`
            )
            .setColor("#2dff2d")
            .addField(
              "Information",
              "Please wait for the recruiter to ask you some questions."
            )
            .setFooter("Thanks for applying!");

          (channel as Discord.TextChannel).send(ticketChannelEmbed);

          return resolve(channel);
        })

        // Catch errors for creating channel
        .catch(err => {
          // Log and reject
          console.error(err);
          return reject(err);
        });
    });
  }
}
