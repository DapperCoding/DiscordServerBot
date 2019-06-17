import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'

export default class RTFMCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?summon/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?summon', description: 'Summon a user (give user permissions to current channel)', roles: ["admin"] }
    }

    public init(bot: IBot, dataPath: string): void { }

    public isValid(msg: string): boolean {
        return this.CMD_REGEXP.test(msg)
    }

    public canUseInChannel(channel:discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("ticket");
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
        
        let summoned = msgObj.guild.member(msgObj.mentions.users.first());
        if (!summoned) {
            msgObj.delete();
            return;
        }
        this.summonUser(summoned, msgObj);

        // Create summoner embed
        let summonerEmbed =this.createSummonerEmbed(summoned, msgObj);

        // Create summoned embed
        let summonedEmbed =this.createSummonedEmbed(summoned, msgObj);

        // Send summoned embed to tagged user
        summoned.send(summonedEmbed).then(newmsg => {
            msgObj.delete(0);
        });

        // Send summoner embed to command user
        msgObj.member.send(summonerEmbed).then(newmsg => {
            msgObj.delete(0);
        });
    }

    private summonUser(user:discord.GuildMember, message:discord.Message) {

        // Add permissions to this channel for creator
        (message.channel as discord.TextChannel).overwritePermissions(user, {
            "READ_MESSAGE_HISTORY": true,
            "SEND_MESSAGES": true,
            "VIEW_CHANNEL": true,
            "EMBED_LINKS": true,
        });
    }

    private createSummonerEmbed(user:discord.GuildMember, message:discord.Message): discord.RichEmbed {

        // Create embed for command user
        return new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle(`You have summoned ${user.displayName}`)
            .setDescription(`Please join the conversation over at #${(message.channel as discord.TextChannel).name}`)
            .setFooter("Thanks in advance!")
    }

    private createSummonedEmbed(user:discord.GuildMember, message:discord.Message): discord.RichEmbed {

        // Create embed for summoned user
        return new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle(`You have been summoned by ${message.author.username}`)
            .setDescription(`Please join the conversation over at #${(message.channel as discord.TextChannel).name}`)
            .setFooter("Have a great 2019!")
    }
}