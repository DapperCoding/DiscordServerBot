import BaseCommand from "../baseCommand";
import { IBotCommandHelp, IBotMessage, IBotConfig, IBotCommand } from "../api";
import { Client, Message, Guild, TextChannel } from "discord.js";
import { websiteBotService } from "../services/websiteBotService";
const uuidv4 = require('uuid/v4');

export default class PrivateChannel extends BaseCommand {

    constructor() {
        super(/^\?privatechannel/im);
    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?privateChannel', description: 'Tag the users you want a private channel with', roles: ["admin"] };
    }

    public process(messageContent: string, answer: IBotMessage, message: Message, client: Client, config: IBotConfig, commands: IBotCommand[], wbs: websiteBotService, guild: Guild) {

        let category = message.guild.channels.find(x => x.name.toLowerCase() == "private-talks");

        //Find the role 'Admin'
        var adminRole = message.guild.roles.find((role) => role.name === "Admin");

        //Find the role 'Dapper Bot'
        var dapperRole = message.guild.roles.find((role) => role.name === "Dapper Bot");

        message.guild.createChannel(uuidv4(), "text", [

            // Give ticket creator permissions to the channel
            {
                id: message.author.id,
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
                id: message.guild.id,
                deny: ['MANAGE_MESSAGES','SEND_MESSAGES', "VIEW_CHANNEL"],
                allow: []
            }]).then(channel => {
                channel.setParent(category);

                message.mentions.members.forEach(member => {

                    // Add permissions for dapper bot
                    channel.overwritePermissions(member, {
                        "READ_MESSAGE_HISTORY": true,
                        "SEND_MESSAGES": true,
                        "VIEW_CHANNEL": true,
                        "EMBED_LINKS": true,
                    });
                });

                (channel as TextChannel).send("I've created a private channel for the admins and " + message.mentions.members.size + " members.")
            })
    }


}