import { compactDiscordUser } from "./compactDiscordUser";

export interface registerModel extends compactDiscordUser {
    registrationCode:string;
    isHappyToHelp:boolean;
}

export class registerModel implements registerModel {
    isHappyToHelp=false;
}