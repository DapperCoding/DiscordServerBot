import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { Constants } from "../constants";
import * as qs from 'querystring';
import * as Turndown from 'turndown';

export default class mdnCommand extends BaseCommand {

    readonly commandWords = ["mdn"];

    public getHelp(): IBotCommandHelp {
        return {
            caption: "?mdn",
            description: "Look up something on the MDN documentation",
        };
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return true;
    }

    public async process(commandData: CommandData): Promise<void> {

        let qe: string = commandData.message.content.split(" ").slice(1).join(" ");
        let match: any;
        let query = qe ? qe.replace(/#/g, '.prototype.') : null;

        if (!query && match) query = match[1];
        const qString = qs.stringify({ q: query });
        const res = await fetch(`https://mdn.pleb.xyz/search?${qString}`);
        const body = await res.json();

        if (!body.URL || !body.Title || !body.Summary) {
            commandData.message.channel.send(`Woops, there was a mistake whilst searching the docs!`);
            return;
        }

        const turndown = new Turndown();
        turndown.addRule('hyperlink', {
            filter: 'a',
            replacement: (text, node) => `[${text}](https://developer.mozilla.org${(node as HTMLLinkElement).href})`
        });

        const summary = body.Summary.replace(/<code><strong>(.+)<\/strong><\/code>/g, '<strong><code>$1</code></strong>');
        const embed = new Discord.RichEmbed()
            .setColor(0x066fad)
            .setAuthor('MDN', 'https://i.imgur.com/DFGXabG.png', 'https://developer.mozilla.org/')
            .setURL(`https://developer.mozilla.org${body.URL}`)
            .setTitle(body.Title)
            .setDescription(turndown.turndown(summary));

        commandData.message.channel!.send(embed);
        return;
    }
}
