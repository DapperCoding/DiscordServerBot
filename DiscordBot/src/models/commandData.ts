import * as Discord from "discord.js";
import { IBotConfig } from "../api";
import { WebsiteBotService } from "../services/websiteBotService";
import { BotCommand } from "./botCommand";

export interface CommandData {
    message: Discord.Message,
    client: Discord.Client,
    guild: Discord.Guild
    config: IBotConfig,
    commands: BotCommand[],
    webBotService: WebsiteBotService,
}

export class CommandData implements CommandData {

}