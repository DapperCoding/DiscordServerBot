import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class RTFMCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?rtfm/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?rtfm', description: 'ADMIN ONLY - (?rtfm [@user]) - Give a noob his own discord bot bible', roles: ["happy to help", "admin"] }
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

            for (let i = 0; i < helpObj.roles.length; i++) {
                let cmdRole = helpObj.roles[i];
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
        let rtfmEmbed =this.createRtfmEmbed(rtfmUser, msgObj);

            msgObj.channel.send(rtfmEmbed).then(newmsg => {
                msgObj.delete(0);
            });
    }

    private createRtfmEmbed(rtfmUser:discord.GuildMember, message:discord.Message): discord.RichEmbed {
        
        let matches = message.content.match(/\bhttps?:\/\/\S+/gi);
        let url = 'https://discord.js.org/#/docs/main/stable/general/welcome/';
        
        if (matches != null) {
            url = matches[0];
        }

        return new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle("The Holy Book of Discord Bots")
            .setURL(url)
            .addField("There's no need to fear, " + rtfmUser.displayName + ".", message.author + " is here to save you. They have bestowed upon you the holy book of Discord Bots. If you read this book each day you will by no doubt develop something great.")
            .setFooter("Always refer to this book before becoming an annoyance to the members of the 'Happy To Help' role")
    }
}