import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class RollCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?roll/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?roll', description: '(?roll [faces]) Rolls a die with your selected number of faces. If left blank, a six-sided die will used instead' }
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
        let words = msg.split(' ');
        let faces = parseInt(words.slice(1).join(' '));
        let result = 1;
        answer.setColor("#ffffff");
        if(isNaN(faces))
        {
            result = Math.floor(Math.random() * 6) + 1;
            answer.setTitle(msgObj.author.username + ", your die landed on a " + result.toString());
        }
        else if(faces == 0 )
        {
            answer.setTitle("Really... A zero sided die? Really???");
        }
        else if(faces < 0 || faces == Infinity )
        {
            answer.setTitle("You broke the die.");
        }
        else
        {
            result = Math.floor(Math.random() * faces) + 1;
            answer.setTitle(msgObj.author.username + ", your die landed on a " + result.toString());
        }
    }
}