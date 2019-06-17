import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import BaseCommand from '../baseCommand';

export default class RTFMCommand extends BaseCommand {
    
    constructor() {
        super(/^\?debugger/im);
    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?debugger @user', description: 'Send information how to use a debugger in vscode', roles: ["admin", "happy to help"] }
    }

    public init(bot: IBot, dataPath: string): void { }


    public canUseInChannel(channel:discord.TextChannel): boolean {

        // Return true because we should be able to send the embed in any channel
        return true;
    }

    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        
        let summoned = msgObj.guild.member(msgObj.mentions.users.first());
        if (!summoned) {
            msgObj.delete();
            return;
        }

        let debuggingEmbed = this.createDebuggerEmbed(summoned, msgObj);

        msgObj.channel.send(debuggingEmbed).then(newmsg => {
            msgObj.delete(0);
        });
    }

    private createDebuggerEmbed(user:discord.GuildMember, message:discord.Message): discord.RichEmbed {

        return new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle(`Hey ${user.user.username} - just a tip`)
            .setDescription('We think you should use a debugging tool, you can find a video about how to use them just below.')
            .addField('documentation:','https://code.visualstudio.com/docs/nodejs/nodejs-debugging')
            .addField("video:", 'https://www.youtube.com/watch?v=2oFKNL7vYV8')
            .setFooter("Thanks in advance!")
    }
    
}