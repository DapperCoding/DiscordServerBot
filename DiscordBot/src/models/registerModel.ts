import { DiscordUser } from "./discordUser";

export interface RegisterModel extends DiscordUser {
    registrationCode: string;
    isHappyToHelp: boolean;
}

export class RegisterModel implements RegisterModel {
    isHappyToHelp = false;
}