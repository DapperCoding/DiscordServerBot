import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class CodeCommand extends BaseCommand {

    readonly commandWords = ["code"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?code', description: 'Use in ticket channels, ask for their code', roles: ['admin', 'happy to help'] }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(commandData: CommandData): Promise<void> {

        let embed = new Discord.RichEmbed();

        embed.setTitle("Please send us your code");
        embed.setDescription(`${commandData.message.author.username} asks you to send your code`);

        let taggedUser = commandData.message.mentions.members.first();
        if (taggedUser != null) {
            embed.addField("Notification", `${taggedUser.user}`, false);
        }

        embed.setColor("0xff0000");

        if (commandData.message.author.avatarURL != null && commandData.message.author.avatarURL.length > 0) {
            embed.setThumbnail(commandData.message.author.avatarURL);
        }
        else {
            embed.setThumbnail(commandData.client.user.displayAvatarURL);
        }

        commandData.message.channel.send(embed);

        commandData.message.delete();
    }
}