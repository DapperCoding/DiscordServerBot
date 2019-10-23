import * as Discord from 'discord.js';
import { BaseDialogueData, BaseDialogue } from './baseDialogue';
import { DialogueHandler, DialogueStep } from '../handlers/dialogueHandler';
import { TagBaseDialogue } from './TagBaseDialogue';

export class TagDialogue extends TagBaseDialogue<TagDialogueData> implements BaseDialogue<TagDialogueData>{

    public async createHandler(
        data: TagDialogueData,
        channel: Discord.TextChannel,
        user: Discord.User,
        callback: (data: TagDialogueData) => void
    ) {
        let nameStep: DialogueStep<
            TagDialogueData
        > = new DialogueStep<TagDialogueData>(
            data,
            this.nameStep,
            "Which name do you wish to cast on this tag?"
        );

        let descStep: DialogueStep<
            TagDialogueData
        > = new DialogueStep<TagDialogueData>(
            data,
            this.descStep,
            "Which description do you wish to cast on this tag?"
        );

        let handler = new DialogueHandler(
            [nameStep, descStep],
            data
        );

        await handler 
        .getInput(
            channel,
            user
        )
        .then(callback);
    }
    public async createNameHandler(
        data: TagDialogueData,
        channel: Discord.TextChannel,
        user: Discord.User,
        callback: (data: TagDialogueData) => void
    ) {
        let nameStep: DialogueStep<
            TagDialogueData
        > = new DialogueStep<TagDialogueData>(
            data,
            this.nameStep,
            "Which name do you wish to cast on this tag?"
        );

        let handler = new DialogueHandler(
            [nameStep],
            data
        );

        await handler
            .getInput(
                channel,
                user
            )
            .then(callback);
    }
}

export interface TagDialogueData extends BaseDialogueData {
    name: string;
    answer: string;
}

export class TagDialogueData implements TagDialogueData { }

export interface TagReturnData extends TagDialogueData {
    id:number
}

export class TagReturnData implements TagReturnData { }