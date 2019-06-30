import * as Discord from "discord.js";
import { IBotConfig, IBotCommand } from "../api";
import { WebsiteBotService } from "../services/websiteBotService";

export interface CommandData {
    message: Discord.Message,
    client: Discord.Client,
    guild: Discord.Guild
    config: IBotConfig,
    commands: IBotCommand[],
    webBotService: WebsiteBotService,
}

export class CommandData implements CommandData {

}