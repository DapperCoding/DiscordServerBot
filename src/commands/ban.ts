import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import { websiteBotService } from '../services/websiteBotService';
import BaseCommand from '../baseCommand';

export default class BanCommand extends BaseCommand {
    
    constructor(){
        super(/^\?ban/im);
    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?ban', description: 'ADMIN ONLY - (?ban [@user] [reason]) to ban the user from the server with a given reason', roles: ["admin"] }
    }
    
    public canUseInChannel(channel:discord.TextChannel): boolean {
        return true;
    }

    public init(bot: IBot, dataPath: string): void { }
    
    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        if(!msgObj.member.hasPermission("MANAGE_MESSAGES"))
        {
            msgObj.channel.send("You don't have the privileges to ban other users!"); //Makes sure the user has the correct permissions to be able to ban other users
            return;
        }
        let bannedUser = msgObj.guild.member(msgObj.mentions.users.first());
        if(!bannedUser)
        {
            msgObj.channel.send("Sorry, I couldn't find that user");
            return;
        }
        let words = msg.split(' ');
        let reason = words.slice(2).join(' ');
        let banEmbed = new discord.RichEmbed() //Creates embed of ban details
            .setDescription("Ban Details")
            .setColor("0x191a1c")
            .addField("Banned User:", bannedUser + " with ID: " + bannedUser.id)
            .addField("Banned By:", msgObj.author + " with ID: " + msgObj.author.id)
            .addField("Banned in the:", msgObj.channel + " channel")
            .addField("Banned at:", msgObj.createdAt)
            .addField("Reason for ban:", reason)
        msgObj.delete(0)
            .then(console.log)
            .catch(console.error);
        (client.channels.get(config.kicksAndBansChannel) as discord.TextChannel).send(banEmbed)
            .then(console.log)
            .catch(console.error);
        msgObj.guild.member(bannedUser).ban(reason) //Actually ban the user from the server
            .then(console.log)
            .catch(console.error);
    }
}