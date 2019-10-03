import { User, TextChannel, DMChannel } from "discord.js";

export interface BaseDialogue<T extends BaseDialogueData> {
    createHandler(data:T, channel:TextChannel|DMChannel, user:User, callback:(data:T)=> void): void
}

export interface BaseDialogueData {

}