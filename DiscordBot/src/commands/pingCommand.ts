import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class PingCommand extends BaseCommand {

    readonly commandWords = ["ping"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?ping', description: 'For testing latency and also having a little fun' }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("other");
    }

    public canUseCommand(roles: Discord.Role[]) {
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

    public async process(commandData: CommandData): Promise<void> {
        let m = await commandData.message.channel.send("Ping?") as any;
        m.edit(`Pong! Latency is ${m.createdTimestamp - commandData.message.createdTimestamp}ms. API Latency is ${Math.round(commandData.client.ping)}ms`)
            .then(console.log)
            .catch(console.error);
    }
}