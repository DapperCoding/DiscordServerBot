import * as Discord from 'discord.js';
import { BaseDialogueData, BaseDialogue } from "./baseDialogue";
import { ValidationError } from '../error';
import { FormBaseDialogue, FormBaseDialogueData } from './formBaseDialogue';

export class TagBaseDialogue<T extends TagBaseDialogueData> implements BaseDialogue<T> {

    createHandler(data: T, channel: Discord.TextChannel | Discord.DMChannel, user: Discord.User, callback: (data: T) => void): void {
        throw new Error("Method not implemented.");
    }

    nameStep(response: Discord.Message, data: T) {
        return new Promise<T>((resolve, reject) => {
            try {
                if (!response.content.length) return reject(new ValidationError(`You must enter a tag name for this process.`));


                data.name = response.content;

                if (data.name.length < 3) return reject(new ValidationError(`You must enter a tag name that is greater than 3 characters in length.`));

                return resolve(data);
            } catch (e) {
                return reject(e);
            }
        });
    }

    descStep(response: Discord.Message, data: T) {
        return new Promise<T>((resolve, reject) => {
            try {
                if (!response.content.length) return reject(new ValidationError(`You must enter a tag description for this process.`));

                data.answer = response.content;

                return resolve(data);
            } catch (e) {
                return reject(e);
            }
        });
    }
}

export interface TagBaseDialogueData extends BaseDialogueData {
    name: string;
    answer: string;
}

export class TagBaseDialogueData implements TagBaseDialogueData { }