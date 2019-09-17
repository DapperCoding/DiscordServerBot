import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class YtdlFixCommand extends BaseCommand {

    readonly commandWords = ["ytdlfix"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?ytdlfix', description: 'Send the automated ytdl-fix message', roles: ["teacher", "admin"] }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return true;
    }

    public canUseCommand(roles: Discord.Role[]) {
        let helpObj: IBotCommandHelp = this.getHelp();
        let canUseCommand = true;

        if (helpObj.roles != null && helpObj.roles.length > 0) {
            canUseCommand = false;

            for (var i = 0; i < helpObj.roles.length; i++) {
                var cmdRole = helpObj.roles[i];
                if (roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase()))
                    canUseCommand = true;
            }
        }

        return canUseCommand;
    }

    public async process(commandData: CommandData): Promise<void> {
        if (!commandData.message.member.hasPermission("MANAGE_MESSAGES")) {
            commandData.message.delete();
            return;
        }
        let rtfmUser = commandData.message.guild.member(commandData.message.mentions.users.first());
        if (!rtfmUser) {
            commandData.message.delete();
            return;
        }
        let rtfmEmbed = this.createYtdlEmbed(rtfmUser, commandData.message);

        commandData.message.channel.send(rtfmEmbed).then(newmsg => {
            commandData.message.delete(0);
        });
    }

    private createYtdlEmbed(ytdlUser: Discord.GuildMember, message: Discord.Message): Discord.RichEmbed {

        let matches = message.content.match(/\bhttps?:\/\/\S+/gi);
        let url = 'https://dapperdino.co.uk/ytdl-fix.zip';

        if (matches != null) {
            url = matches[0];
        }

        return new Discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle("The YTDL Fix")
            .setURL(url)
            .addField("Please download the zip file " + ytdlUser.displayName + ".", message.author + " asks you to download the zip file and extract the files to your node_modules folder (overwrite files).")
            .addField("Video explanation:", "https://www.youtube.com/watch?v=MsMYrxyYNZc")
            .setFooter("If you keep experiencing errors, feel free to ask your question in a ticket.")
    }
}