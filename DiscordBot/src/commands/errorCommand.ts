import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class ErrorCommand extends BaseCommand {

    readonly commandWords = ["error"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?error', description: 'Use in ticket channels, ask for error information', roles: ['admin', 'teacher'] }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(commandData: CommandData): Promise<void> {

        let embed = new Discord.RichEmbed();

        embed.setTitle("Please send us your errors");
        embed.setDescription(`${commandData.message.author.username} asks you to send your errors`);
        embed.addField("Screenshot", "Please send us a screenshot of your error too", false)

        let taggedUser = commandData.message.mentions.members.first();
        if (taggedUser != null) {
            embed.addField("Notification", `${taggedUser.user}`, false)
        }

        embed.setColor("0xff0000");

        if (commandData.message.author.avatarURL != null && commandData.message.author.avatarURL.length > 0) {
            embed.setThumbnail(commandData.message.author.avatarURL);
        }
        else {
            embed.setThumbnail(commandData.client.user.displayAvatarURL);
        }


        commandData.message.delete();
    }
}