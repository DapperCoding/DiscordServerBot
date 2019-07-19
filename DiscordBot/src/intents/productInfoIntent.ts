import BaseIntent from "../baseIntent";
import { IntentData } from "../models/intentData";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { RichEmbed } from "discord.js";

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

    new ApiRequestHandler(intentData.client)
      .requestAPIWithType<any>("GET", null, "product/" + this.id)
      .then(product => {
        const embed = new RichEmbed()
          .setTitle(
            `Information about our '${product.name}' ($${product.price})`
          )
          .setDescription(product.description)
          .setURL("https://dapperdino.co.uk/Products/Information/" + product.id)
          .setFooter("Click on the title to open in your web browser");

        if (product.instructions) {
          embed.addField(
            product.instructions.name,
            product.instructions.description
          );
        }

        if (product.categories && product.categories.length > 0) {
          let categoryField = "";
          for (let i = 0; i < product.categories.length; i++) {
            let cat = product.categories[i].productCategory;
            categoryField += `${cat.name} (${cat.description}) \n`;
          }
          embed.addField("Categories", categoryField);
        }

        if (product.productImages && product.productImages.length > 0) {
          for (let i = 0; i < product.productImages.length; i++) {
            let image = product.productImages[i];

            if (image.isHeaderImage) {
              embed.setImage(image.url);
            }
          }
        }

        intentData.message.channel.send(embed);
      })
      .catch(console.error);
  }
}
