import { Message, Client } from "discord.js";
import { IBotConfig } from "../api";

export interface IntentData {
    message: Message,
    client: Client,
    config: IBotConfig,
}

export class IntentData implements IntentData {

}