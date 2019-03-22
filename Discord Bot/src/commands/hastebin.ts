import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import * as discord from 'discord.js'
import BaseCommand from '../baseCommand';
import * as snekfetch from 'snekfetch';

export default class HastebinCommand extends BaseCommand {

    /**
     *
     */
    constructor() {
        super(/^\?hastebin/im);

    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?hastebin', description: 'Posts code to hastebin.' }
    }

    public init(bot: IBot, dataPath: string): void { }


    public canUseInChannel(channel: discord.TextChannel): boolean {
        return !channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(msg: string, answer: IBotMessage, message: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {

        // Split content, take the first part of and take it back together
        const code = message.content.split(" ").shift().join(" ");

        // Post code to hastebin
        snekfetch.post('https://hastebin.com/documents')
            .send(code)
            .then(res => {

                // Now send the embed
                this.sendEmbed(res, message);
            })
    }

    private sendEmbed(res: any, message: discord.Message) {

        // Create meme embed
        let hasteEmbed = new discord.RichEmbed()

            // Set the title 
            .setTitle(`${message.author.username} has posted some code to hastebin`)

            // Set the URL to the hastbin link
            .setURL(`https://hastebin.com/${res.body.key}`)

            // Set color of embed
            .setColor("#ff0000")

            // Set the description of the embed
            .setDescription(`Here is the URL to your hastebin link.\nhttps://hastebin.com/${res.body.key}`)

            // Set timestamp to current time
            .setTimestamp()

            // Set footer to 'posted by mickie456' if author was mickie456
            .setFooter(`posted by ${post.data.author}`);

        // Send embed
        message.channel.send(hasteEmbed);

        // Remove the original message
        message.delete();
    }

}