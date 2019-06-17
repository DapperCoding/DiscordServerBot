import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class PurgeCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?purge/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?purge', description: 'ADMIN ONLY - (?purge [number of message to delete]) Bulk delete a number of messages from the channel', roles: ["admin"] }
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

            for (var i = 0;i < helpObj.roles.length; i++) {
                var cmdRole = helpObj.roles[i];
                if (roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase()))
                    canUseCommand = true;
            }
        }

        return canUseCommand;
    }
    
    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        msgObj.delete(0);
        if(!msgObj.member.hasPermission("MANAGE_MESSAGES"))
        {
            return;
        }
        let words = msg.split(' ');
        let amount = parseInt(words.slice(1).join(' '));
        if(isNaN(amount))
        {
            return;
        }
        msgObj.channel.bulkDelete(amount)
            .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
            .catch(console.error)
    }
}