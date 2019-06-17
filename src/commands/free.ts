import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import BaseCommand from '../baseCommand';

export default class FreeUserCommand extends BaseCommand {

    /**
     *
     */
    constructor() {
        super(/^\?free/im);
    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?free', description: 'Free a user (remove user permissions from current channel)', roles: ["admin", "happy to help"] }
    }

    public init(bot: IBot, dataPath: string): void { }

    public canUseInChannel(channel: discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {

        // Get tagged user
        let freed = msgObj.guild.member(msgObj.mentions.users.first());

        // Check if there's a member tagged, if not we remove the message and quit processing the command
        if (!freed) {
            msgObj.delete();
            return;
        }

        // Remove permissions from channel
        this.freeUser(freed, msgObj);

        // Create summoner embed
        let commandUserEmbed = this.createCommandUserEmbed(freed, msgObj);

        // Create summoned embed
        let freedEmbed = this.createFreedUserEmbed(freed, msgObj);

        // Send summoned embed to tagged user
        freed.send(freedEmbed).then(newmsg => {
            msgObj.delete(0);
        });

        // Send summoner embed to command user
        msgObj.member.send(commandUserEmbed).then(newmsg => {
            msgObj.delete(0);
        });
    }

    private freeUser(user: discord.GuildMember, message: discord.Message) {

        // Add permissions to this channel for creator
        (message.channel as discord.TextChannel).overwritePermissions(user, {
            "READ_MESSAGE_HISTORY": false,
            "SEND_MESSAGES": false,
            "VIEW_CHANNEL": false,
            "EMBED_LINKS": false,
        });
    }

    private createCommandUserEmbed(user: discord.GuildMember, message: discord.Message): discord.RichEmbed {

        // Create embed for command user
        return new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle(`You have freed ${user.displayName}`)
            .setDescription(`This is just a notification`)
            .setFooter("Have a great 2019!")
    }

    private createFreedUserEmbed(user: discord.GuildMember, message: discord.Message): discord.RichEmbed {

        // Create freed embed
        return new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle(`You have been freed by ${message.author.username}`)
            .setDescription(`Please join the conversation over at #${(message.channel as discord.TextChannel).name}`)
            .setFooter("Thanks in advance!")
    }
}