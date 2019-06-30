import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class RollCommand extends BaseCommand {

    readonly commandWords = ["roll"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?roll', description: '(?roll [faces]) Rolls a die with your selected number of faces. If left blank, a six-sided die will used instead' }
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
        let words = commandData.message.content.split(' ');
        let faces = parseInt(words.slice(1).join(' '));
        let result = 1;

        let embed = new Discord.RichEmbed();

        embed.setColor("#ffffff");
        if (isNaN(faces)) {
            result = Math.floor(Math.random() * 6) + 1;
            embed.setTitle(commandData.message.author.username + ", your die landed on a " + result.toString());
        }
        else if (faces == 0) {
            embed.setTitle("Really... A zero sided die? Really???");
        }
        else if (faces < 0 || faces == Infinity) {
            embed.setTitle("You broke the die.");
        }
        else {
            result = Math.floor(Math.random() * faces) + 1;
            embed.setTitle(commandData.message.author.username + ", your die landed on a " + result.toString());
        }

        commandData.message.channel.send(embed);
    }
}