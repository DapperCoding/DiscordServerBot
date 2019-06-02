import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import BaseCommand from '../baseCommand';
const fetch = require('node-fetch')

export default class DjsCommand extends BaseCommand {

    constructor() {
        super(/^\?djs/im);
    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?djs', description: 'Search discord js docs' } //, roles: ['admin', 'happy to help']
    }

    public canUseInChannel(channel: discord.TextChannel): boolean {
        return true;
    }

    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        
        let args = msg.split(" ");
        let command = args.shift();
        let flag = args.pop() || "";

        let v = 'stable';

        if(['--stable', '--master'].includes(flag)){
          v = flag.substr(2);  
        } else {
            args.push(flag);
        }
        const response = args.join(' ');

        const url = `https://djsdocs.sorta.moe/main/${v}/embed?q=${encodeURIComponent(response)}`;

        fetch(url)
            .then(res => res.json())
            .then(embed => {
                if (embed && !embed.error) {
                    msgObj.channel.send({ embed });
                } else {
                    msgObj.reply(`I'm sorry I couldn't find what you're looking for!`);
                }
            })
            .catch(e => {
                console.error(e);
                msgObj.reply('Sorry it seems like im having difficulties');
            })
    }
}