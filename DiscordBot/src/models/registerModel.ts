import { CompactDiscordUser } from "./compactDiscordUser";

export interface RegisterModel extends CompactDiscordUser {
    registrationCode: string;
    isHappyToHelp: boolean;
}

export class RegisterModel implements RegisterModel {
    isHappyToHelp = false;
}