import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class ServerInfoCommand extends BaseCommand {

    readonly commandWords = ["serverinfo"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?serverinfo', description: 'Here is some information about our server' }
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

        embed.setDescription("Server Information");
        embed.setColor("0xff0000");
        embed.setThumbnail(commandData.guild.icon);
        embed.addField("The best server ever:", commandData.message.guild.name, false);
        embed.addField("Was created on:", commandData.message.guild.createdAt.toString(), false);
        embed.addField("You joined us on:", commandData.message.member.joinedAt.toString(), false);
        embed.addField("Our member count is currently at:", commandData.webBotService.GetServerPopulation().toString(), false);
    }
}