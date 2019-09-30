import * as Discord from 'discord.js'
import { IBotCommandHelp } from '../api'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

const fetch = require('node-fetch');

export default class DjsCommand extends BaseCommand {

    readonly commandWords = ["djs"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?djs', description: 'Search discord js docs' }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return true;
    }

    public async process(commandData: CommandData): Promise<void> {

        let args = commandData.message.content.split(" ");
        let command = args.shift();
        let flag = args.pop() || "";

        let v = 'stable';

        if (['--stable', '--master', '--commando'].includes(flag)) {
            v = flag.substr(2);
        } else {
            args.push(flag);
        }
        const response = args.join(' ');

        const url = `https://djsdocs.sorta.moe/v2/embed?src=${v}&q=${encodeURIComponent(response)}`;

        fetch(url)
            .then(res => res.json())
            .then(embed => {
                if (embed && !embed.error) {
                    commandData.message.channel.send({ embed }).then(async m => {
                        await (m as Discord.Message).react('🗑');
                        const collector = (m as Discord.Message).createReactionCollector((reaction, user) => user.id === commandData.message.author.id, { time: 10000 });

                        collector.on('collect', r => {
                            if (r.emoji.name === '🗑') {
                                r.message.delete();
                                commandData.message.delete();
                            }
                        });

                        collector.on('end', r => {
                            if (r.size <= 0 && r.first().message.channel.type !== 'dm') {
                                (m as Discord.Message).reactions.clear();
                            }
                        });
                    });
                } else {
                    commandData.message.reply(`I'm sorry I couldn't find what you're looking for!`);
                }
            })
            .catch(e => {
                console.error(e);
                commandData.message.reply('Sorry it seems like im having difficulties');
            });
    }
}
