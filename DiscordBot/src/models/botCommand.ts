import * as Discord from "discord.js";
import { IBot, IBotConfig, IBotCommandHelp } from "../api";
import { CommandData } from "./commandData";

export interface BotCommand {
    readonly commandWords: string[];
    init(bot: IBot, dataPath: string): void;
    isValid(message: string, config: IBotConfig): boolean;
    getHelp(): IBotCommandHelp;
    process(commandData: CommandData): Promise<void>;
    canUseInChannel(channel: Discord.TextChannel): boolean;
    canUseCommand(roles: Discord.Role[], message?: Discord.Message): boolean;
}

export class BotCommand implements BotCommand {

}