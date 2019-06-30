import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class MirrorCommand extends BaseCommand {

    readonly commandWords = ["mirror"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?mirror', description: 'Everyone loves recieving compliments, right?' }
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

        let embed = new Discord.RichEmbed();

        if (commandData.message.author.avatarURL != null) {

            embed.setDescription(`${commandData.message.member}, you're looking beautiful today :)`);

            let m = await commandData.message.channel.send(commandData.message.author.avatarURL) as any;

            m.react('😍')
                .then(console.log)
                .catch(console.error)
        }
        else {
            embed.setDescription(`${commandData.message.member}, you broke the mirror! You really should get a profile pic for discord, make yourself look beautiful.`);
        }

        commandData.message.channel.send(embed);
    }
}