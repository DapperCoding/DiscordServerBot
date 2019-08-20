import { GuildMember, TextChannel, Guild } from "discord.js";
import { Ticket } from "../models/ticket/ticket";

export class TicketHelper {
  public static updateTopic(member: GuildMember, ticket: Ticket) {
    // Find channel
    let channel = member.guild.channels.find(
      c => c.name.toLowerCase() === `ticket${ticket.id}`
    ) as TextChannel;

    // Do nothing if we can't find the channel
    if (!channel) {
      return;
    }

    // Set topic
    channel.setTopic(
      `This ticket is created by ${member.user.username} \n\n\n Subject:\n${
        ticket.subject
      } \n\n Description:\n${ticket.description} \n\n Framework:\n ${
        ticket.framework.name
      } \n\n Language: \n ${ticket.language.name}`
    );
  }

  public static async fixPermissions(guild: Guild, ticket: Ticket) {
    // Find channel
    let channel = guild.channels.find(
      c => c.name.toLowerCase() === `ticket${ticket.id}`
    ) as TextChannel;

    // Do nothing if we can't find the channel
    if (!channel) {
      return;
    }

    // Set parent to the category channel
    await channel.setParent(
      guild.channels.find(c => c.name.toLowerCase() === "tickets")
    );

    //Find the role 'Admin'
    var adminRole = guild.roles.find(role => role.name === "Admin");

    //Find the role 'Dapper Bot'
    var dapperBotRole = guild.roles.find(role => role.name === "DapperBot");

    //Find the role 'Dapper Coding'
    var dapperCodingRole = guild.roles.find(
      role => role.name === "DapperCoding"
    );

    //Find the role 'DapperWeb'
    var dapperWebRole = guild.roles.find(role => role.name === "DapperWeb");

    // Add permissions for creator
    channel.overwritePermissions(ticket.applicant.discordId, {
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

    // Add permissions for dapper coding
    channel.overwritePermissions(dapperCodingRole, {
      READ_MESSAGE_HISTORY: true,
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
      EMBED_LINKS: true
    });

    // Add permissions for dapper bot
    channel.overwritePermissions(dapperBotRole, {
      READ_MESSAGE_HISTORY: true,
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
      EMBED_LINKS: true
    });

    // Add permissions for dapper web
    channel.overwritePermissions(dapperWebRole, {
      READ_MESSAGE_HISTORY: true,
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
      EMBED_LINKS: true
    });

    // Remove permissions for everyone else
    channel.overwritePermissions(guild.id, {
      READ_MESSAGE_HISTORY: false,
      SEND_MESSAGES: false,
      VIEW_CHANNEL: false
    });
  }
}
