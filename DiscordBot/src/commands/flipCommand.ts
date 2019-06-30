import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class FlipCommand extends BaseCommand {

    commandWords = ["flip"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?flip', description: 'Flips a coin. Landing on either heads or tails' }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return !channel.name.toLowerCase().startsWith("ticket");
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

        let options = ['your coin landed on tails', 'your coin landed on heads'];

        let embed = new Discord.RichEmbed();

        embed.setTitle(commandData.message.author.username + ", " + options[Math.floor(Math.random() * options.length)]);
        embed.setColor("#ffe100");

        commandData.message.channel.send(embed);
    }
}