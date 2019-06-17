import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import * as superAgent from 'superagent'

export default class DoggoCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?doggo/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?doggo', description: 'Summons a good boi :3' }
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
        let{body} = await superAgent
            .get(`https://random.dog/woof.json`)
        answer.setColor("#ff0000");
        answer.setTitle("Here's a good doggo for youuuu");
        answer.setDescription("You really deserved this :)");
        answer.setImage(body.url);  
    }
}