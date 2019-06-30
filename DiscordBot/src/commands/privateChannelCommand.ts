import BaseCommand from "../baseCommand";
import { IBotCommandHelp } from "../api";
import { TextChannel } from "discord.js";
import { CommandData } from "../models/commandData";
const uuidv4 = require('uuid/v4');

export default class PrivateChannelCommand extends BaseCommand {

    readonly commandWords = ["privatechannel"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?privateChannel', description: 'Tag the users you want a private channel with', roles: ["admin"] };
    }

    public async process(commandData: CommandData): Promise<void> {

        let category = commandData.message.guild.channels.find(x => x.name.toLowerCase() == "private-talks");

        //Find the role 'Admin'
        var adminRole = commandData.message.guild.roles.find((role) => role.name === "Admin");

        //Find the role 'Dapper Bot'
        var dapperRole = commandData.message.guild.roles.find((role) => role.name === "Dapper Bot");

        commandData.message.guild.createChannel(uuidv4(), "text", [

            // Give ticket creator permissions to the channel
            {
                id: commandData.message.author.id,
                deny: ['MANAGE_MESSAGES'],
                allow: ['READ_MESSAGE_HISTORY', "SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS"]
            },

            // Give admins access to the channel
            {
                id: adminRole,
                deny: [],
                allow: ['READ_MESSAGE_HISTORY', "SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS", "MANAGE_MESSAGES"]
            },

            // Give Dapper Bot access to the channel
            {
                id: dapperRole,
                deny: [],
                allow: ['READ_MESSAGE_HISTORY', "SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS", "MANAGE_MESSAGES"]
            },

            // Deny other users
            {
                id: commandData.message.guild.id,
                deny: ['MANAGE_MESSAGES', 'SEND_MESSAGES', "VIEW_CHANNEL"],
                allow: []
            }]).then(channel => {
                channel.setParent(category);

                commandData.message.mentions.members.forEach(member => {

                    // Add permissions for dapper bot
                    channel.overwritePermissions(member, {
                        "READ_MESSAGE_HISTORY": true,
                        "SEND_MESSAGES": true,
                        "VIEW_CHANNEL": true,
                        "EMBED_LINKS": true,
                    });
                });

                (channel as TextChannel).send("I've created a private channel for the admins and " + commandData.message.mentions.members.size + " members.")
            })
    }
}