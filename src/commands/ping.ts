import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class PingCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?ping/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?ping', description: 'For testing latency and also having a little fun' }
    }

    public init(bot: IBot, dataPath: string): void { }

    public isValid(msg: string): boolean {
        return this.CMD_REGEXP.test(msg)
    }

    public canUseInChannel(channel:discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("other");
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
        let m = await msgObj.channel.send("Ping?") as any; //Sends a temporary message
        m.edit(`Pong! Latency is ${m.createdTimestamp - msgObj.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`) //Once the message has been sent and recieved it then calcualtes lantency and edits the previous message to inform the user
            .then(console.log)
            .catch(console.error);
    }
}