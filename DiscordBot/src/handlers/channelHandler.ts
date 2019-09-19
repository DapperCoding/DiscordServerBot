import * as Discord from "discord.js";
import { Constants } from "../constants";

export class ChannelHandler {
  private _guild: Discord.Guild;

  constructor(guild: Discord.Guild) {
    this._guild = guild;
  }

  /**
   * @name: createChannelTicketCommand
   * @description: Creates a ticket channel based on the ticket command
   * @param {ticketId} Number
   * @param {member} GuildMember
   */
  public async createChannelTicketCommand(
    ticketId: number,
    member: Discord.GuildMember
  ) {
    // Return new promise, contains the discord channel if it's resolved
    return new Promise<Discord.Channel>(async (resolve, reject) => {
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
        .createChannel(`ticket${ticketId}`, "text")

        // If ticket channel is created
        .then(async channel => {
          // Set parent to the category channel
          await channel.setParent(category);

          // Add permissions for creator
          channel.overwritePermissions(member, {
            VIEW_CHANNEL: true,
            READ_MESSAGES: true
          });

          let ticketChannelEmbed = new Discord.RichEmbed()
            .setTitle(
              `Hello ${member.user.username}, welcome to our Ticket managing service!`
            )
            .setThumbnail("https://dapperdino.co.uk/images/dapperbot.png")
            .setDescription(
              "We have received your ticket and have notified all Happy-To-Help members."
            )
            .setColor(Constants.EmbedColors.GREEN)
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
   * @name: addPermissionsToChannelTicketCommand
   * @description: add permissions for this channel to the h2h-er that used ?acceptTicket {ticketId}
   * @param {ticketId} Number
   * @param {message} Message
   * @param {embed} RichEmbed
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
        VIEW_CHANNEL: true,
        READ_MESSAGES: true
      });

      (channel as Discord.TextChannel).send(embed);
    }
  }

  /**
   * @name: createChannelForInterview
   * @description: Creates a channel for an interview and sets permissions for the applicant and the recruiter requesting an interview
   * @param {interviewType} String
   * @param {formId} Number
   * @param {applicant} GuildMember
   * @param {recruiter} GuildMember
   */
  public async createChannelForInterview(
    interviewType: string,
    formId: number,
    applicant: Discord.GuildMember,
    recruiter: Discord.GuildMember
  ) {
    // Return new promise, contains the discord channel if it's resolved
    return new Promise<Discord.Channel>(async (resolve, reject) => {
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
        .createChannel(`${interviewType}-${formId}`, "text")

        // If ticket channel is created
        .then(async channel => {
          // Set parent to the category channel
          await channel.setParent(category);

          const addPermissions = {
            VIEW_CHANNEL: true,
            READ_MESSAGES: true
          };
          // Add permissions for creator
          await channel.overwritePermissions(applicant, addPermissions);

          // Add permissions for recruiter
          await channel.overwritePermissions(recruiter, addPermissions);

          let ticketChannelEmbed = new Discord.RichEmbed()
            .setTitle(
              `Hello ${applicant.user.username}, let's find out if you're a match for our team!`
            )
            .setThumbnail("https://dapperdino.co.uk/images/dapperbot.png")
            .setDescription(
              `We have received your application and ${recruiter.user.username} will interview you!.`
            )
            .setColor(Constants.EmbedColors.GREEN)
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
