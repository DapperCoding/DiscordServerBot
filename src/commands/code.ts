import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import BaseCommand from '../baseCommand';

export default class BotInfoCommand extends BaseCommand {

    constructor() {
        super(/^\?code/im);
    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?code', description: 'Use in ticket channels, ask for their code', roles: ['admin', 'happy to help'] }
    }

    public canUseInChannel(channel: discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        answer.setTitle("Please send us your code");
        answer.setDescription(`${msgObj.author.username} asks you to send your code`);

        let taggedUser = msgObj.mentions.members.first();
        if (taggedUser != null)
            answer.addField("Notification", `${taggedUser.user}`, false)

        answer.setColor("0xff0000");

        if (msgObj.author.avatarURL != null && msgObj.author.avatarURL.length > 0)
            answer.setThumbnail(msgObj.author.avatarURL);
        else
            answer.setThumbnail(client.user.displayAvatarURL);

        msgObj.delete();
    }
}