import BaseIntent from "../baseIntent";
import { RichEmbed, Message, MessageReaction, User, TextChannel, Client } from "discord.js"
import { IntentData } from "../models/intentData";
import { ProductHelper } from "../helpers/productHelper";
import { ClientHelper } from "../helpers/clientHelper";

export default class ChangeDefaultCommandoCommandsIntent extends BaseIntent {

    intent = "custombot";

    public async process(intentData: IntentData): Promise<void> {

        ProductHelper.createCustomBotReactionHandler(intentData.client, intentData.message.author.id, intentData.message.channel as TextChannel, null);

    }

    
}