import * as Discord from 'discord.js';
import BaseCommand from "../baseCommand";
import { TagDialogue, TagDialogueData, TagReturnData } from '../dialogues/tagDialogue';
import { IBotCommandHelp } from '../api';
import { CommandData } from '../models/commandData';
import { ApiRequestHandler } from '../handlers/apiRequestHandler';
import { TagBaseDialogueData } from '../dialogues/TagBaseDialogue';
import { Constants } from '../constants';

export default class tagCommand extends BaseCommand {
    dialogue: TagDialogue = new TagDialogue();

    readonly commandWords = ["tag"];

    public getHelp(): IBotCommandHelp {
        return {
            caption: '?tag',
            description: 'Returns a tag from the database if found (depending on the action done).'
        }
    }

    public async process(cmdData: CommandData): Promise<void> {

        const msg = cmdData.message.content.toLowerCase();
        const splitted = msg.split(" ");
        const valueToCheck = splitted[1];

        if (valueToCheck === 'search') return this.searchTag(cmdData.message);
        if (valueToCheck === 'add') return this.addTag(cmdData.message);
        if (msg.match(/i\s*d\s*s\s*e\s*a\s*r\s*c\s*h/)) return this.IDSearch(cmdData.message);
    }

    public async searchTag(message: Discord.Message) {

        const collectedInfo = new TagDialogueData();

        this.dialogue.createNameHandler(
            collectedInfo,
            (message.channel as Discord.TextChannel),
            message.author,
            (data) => {
                new ApiRequestHandler(message.client)
                    .requestAPIWithType<TagDialogueData>("GET", null, `Tag/byName/${data.name}`)
                    .then((tag) => {
                        const embed = new Discord.RichEmbed()
                            .setTitle(tag.name)
                            .setDescription(tag.answer);
                        message.channel.send(embed);
                    })
            }
        )
    }

    public async addTag(message: Discord.Message) {

        const collectedInfo = new TagDialogueData();

        this.dialogue.createHandler(
            collectedInfo,
            (message.channel as Discord.TextChannel),
            message.author,
            (data) => {
                new ApiRequestHandler(message.client)
                    .requestAPIWithType<TagReturnData>("GET", null, `Tag/byName/${data.name}`)
                    .then((tag) => {
                        let url = `Tag/${message.author.id}`

                        if (tag != null) {
                            url += `/${tag.id}`;
                        }

                        new ApiRequestHandler(message.client)
                            .requestAPIWithType<TagReturnData>("POST", data, url)
                            .then((tag) => {
                                const embed = new Discord.RichEmbed()
                                    .setTitle("Successfully added "+ tag.name)
                                    .setDescription(tag.answer);
                                message.channel.send(embed);
                            })
                    })

                
            }
        )
    }

    public async IDSearch(message: Discord.Message) {
        const id = message.content.split(" ").pop();

        if (id == null || isNaN(parseInt(id))) { return; }
        new ApiRequestHandler(message.client)
            .requestAPIWithType<TagReturnData>("GET", null, `Tag/${id}`).then(tag => {
                const embed = new Discord.RichEmbed()
                    .setTitle(tag.name)
                    .setDescription(tag.answer);
                message.channel.send(embed);
            })
    }
}