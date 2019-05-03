import { discordUser } from "./discordUser";

export interface suggest {
    description: string;
    type: SuggestionTypes;
    discordUser: discordUser
    id: string;
    status:SuggestionStatus;
}

export enum SuggestionTypes {
    Bot = 0,
    Website = 1,
    General = 2,
    Youtube = 3,
    Undecided = 4
}

export enum SuggestionStatus {
    Abandoned = 0,
    WorkInProgress = 1,
    InConsideration = 2,
    Completed = 3,
    Future = 4,
    NotLookedAt = 5
}


export class suggest implements suggest {

}