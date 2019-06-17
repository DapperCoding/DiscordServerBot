import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class RTFMCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?ytdlfix/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?ytdlfix', description: 'Send the automated ytdl-fix message', roles: ["happy to help", "admin"] }
    }

    public init(bot: IBot, dataPath: string): void { }

    public isValid(msg: string): boolean {
        return this.CMD_REGEXP.test(msg)
    }

    public canUseInChannel(channel:discord.TextChannel): boolean {
        return true;
    }

    public canUseCommand(roles: discord.Role[]) {
        let helpObj: IBotCommandHelp = this.getHelp();
        let canUseCommand = true;

        if (helpObj.roles != null && helpObj.roles.length > 0) {
            canUseCommand = false;

            for (var i = 0;i < helpObj.roles.length; i++) {
                var cmdRole = helpObj.roles[i];
                if (roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase()))
                    canUseCommand = true;
            }
        }

        return canUseCommand;
    }

    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        if (!msgObj.member.hasPermission("MANAGE_MESSAGES")) {
            msgObj.delete();
            return;
        }
        let rtfmUser = msgObj.guild.member(msgObj.mentions.users.first());
        if (!rtfmUser) {
            msgObj.delete();
            return;
        }
        let rtfmEmbed =this.createYtdlEmbed(rtfmUser, msgObj);

            msgObj.channel.send(rtfmEmbed).then(newmsg => {
                msgObj.delete(0);
            });
    }

    private createYtdlEmbed(ytdlUser:discord.GuildMember, message:discord.Message): discord.RichEmbed {
        
        let matches = message.content.match(/\bhttps?:\/\/\S+/gi);
        let url = 'https://dapperdino.co.uk/ytdl-fix.zip';
        
        if (matches != null) {
            url = matches[0];
        }

        return new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle("The YTDL Fix")
            .setURL(url)
            .addField("Please download the zip file " + ytdlUser.displayName + ".", message.author + " asks you to download the zip file and extract the files to your node_modules folder (overwrite files).")
            .addField("Video explanation:", "https://www.youtube.com/watch?v=MsMYrxyYNZc")
            .setFooter("If you keep experiencing errors, feel free to ask your question in a ticket.")
    }
}