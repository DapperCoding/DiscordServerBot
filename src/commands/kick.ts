import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class KickCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?kick/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?kick', description: 'ADMIN ONLY - (?kick [@user] [reason]) to kick the user from the server with a given reason', roles: ["admin"] }
    }

    public init(bot: IBot, dataPath: string): void { }

    public isValid(msg: string): boolean {
        return this.CMD_REGEXP.test(msg)
    }

    public canUseInChannel(channel:discord.TextChannel): boolean {
        return !channel.name.toLowerCase().startsWith("ticket");
    }

    public canUseCommand(roles: discord.Role[]) {
        let helpObj: IBotCommandHelp = this.getHelp();
        let canUseCommand = true;

        if (helpObj.roles != null && helpObj.roles.length > 0) {
            canUseCommand = false;

            for (var cmdRole in helpObj.roles) {
                if (roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase()))
                    canUseCommand = true;
            }
        }

        return canUseCommand;
    }
    
    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        if(!msgObj.member.hasPermission("MANAGE_MESSAGES"))
        {
            msgObj.channel.send("You don't have the privileges to kick other users!"); //Makes sure the user has the correct permissions to be able to kick other users
            return;
        }
        let kickedUser = msgObj.guild.member(msgObj.mentions.users.first());
        if(!kickedUser)
        {
            msgObj.channel.send("Sorry, I couldn't find that user");
            return;
        }
        let words = msg.split(' ');
        let reason = words.slice(2).join(' ');
        let kickEmbed = new discord.RichEmbed() //Creates embed of kick details
            .setDescription("Kick Details")
            .setColor("0x191a1c")
            .addField("Kicked User:", kickedUser + " with ID: " + kickedUser.id)
            .addField("Kicked By:", msgObj.author + " with ID: " + msgObj.author.id)
            .addField("Kicked in the:", msgObj.channel + " channel")
            .addField("Kicked at:", msgObj.createdAt)
            .addField("Reason for kick:", reason)
        msgObj.delete(0)
            .then(console.log)
            .catch(console.error);
        (client.channels.get(config.kicksAndBansChannel) as discord.TextChannel).send(kickEmbed)
            .then(console.log)
            .catch(console.error);
        msgObj.guild.member(kickedUser).kick(reason) //Actually kick the user from the server
            .then(console.log)
            .catch(console.error);
    }
}