import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class MirrorCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?mirror/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?mirror', description: 'Everyone loves recieving compliments, right?' }
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
        if(msgObj.author.avatarURL != null){
            answer.setTextOnly(msgObj.member + " you're looking beautiful today :)"); //Sends a heart-warming response
            let m = await msgObj.channel.send(msgObj.author.avatarURL) as any; //Waits until it has sent our avatar icon then reacts to it with the emoji
            m.react('😍')
                .then(console.log)
                .catch(console.error)       
        }
        else
        {
            answer.setTextOnly(msgObj.member + " you broke the mirror! You really should get a profile pic for discord, make yourself look beautiful.");
        }
    }
}