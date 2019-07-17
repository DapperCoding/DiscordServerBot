import { Client, RichEmbed, TextChannel } from "discord.js";

export class FaqUpdateEvent {
  public static async handle(serverBot: Client, faq: any) {
    // Get FAQ channel
    let faqChannel = serverBot.channels.find(
      x => x.type === "text" && (x as TextChannel).name == "f-a-q"
    );

    // If FAQ channel is found
    if (faqChannel) {
      // Get as text channel
      let channel = faqChannel as TextChannel;

      // Try to find discordMessage with id of updated faq item
      let message = await channel.fetchMessage(faq.discordMessage.messageId);

      // Create faq embed
      let faqEmbed = new RichEmbed()
        .setTitle("-Q: " + faq.question)
        .setDescription("-A: " + faq.answer)
        .setColor("#2dff2d");

      // Check if resource link is present
      if (faq.resourceLink != null) {
        // Add resource link to faq embed
        faqEmbed.addField(
          "Useful Resource: ",
          `[${faq.resourceLink.displayName}](${faq.resourceLink.link})`
        );
      }

      // Try to delete discordMessage, then add the updated version
      message
        .edit(faqEmbed)
        .then(console.log)
        .catch(console.error);

      return true;
    }
  }
}
