import BaseIntent from "../baseIntent";
import { IntentData } from "../models/intentData";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { RichEmbed, TextChannel } from "discord.js";
import { ProductHelper } from "../helpers/productHelper";

export default class ProductInfoIntent extends BaseIntent {
  intent = "productinfo";

  private id: number = -1;

  public isValid(intent: string): boolean {
    if (intent.toLowerCase().startsWith(this.intent)) {
      this.id = Number(intent.split("-")[1]);
      return true;
    }
    return false;
  }

  public async process(intentData: IntentData): Promise<void> {
    // TODO: get info about product

    console.log(this.id);

    ProductHelper.createProductInfoReactionHandler(this.id, intentData.client, intentData.message.author.id, intentData.message.channel as TextChannel, null);
  }
}
