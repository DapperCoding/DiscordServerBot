import { Message, TextChannel, CategoryChannel } from "discord.js";
import { ServiceHelper } from "../../helpers/serviceHelper";
import { Bot } from "../../bot";
import { XpHandler } from "../../handlers/xpHandler";
import { LuisCommandHandler } from "../../handlers/luisCommandHandler";
import { CommandHandler } from "../../handlers/commandHandler";
import { ConfigManager } from "../../configManager";
import { GuildHelper } from "../../helpers/guildHelper";

export class MessageEvent {
  public static handle(message: Message) {
    const config = ConfigManager.GetConfig();
    // Make sure that the bot isn't responding to itself
    const messageService = ServiceHelper.getMessageService();
    if (message.author.bot) {
      if (message.channel.type === "dm") {
        return;
      } else if (
        (message.channel as TextChannel).name.toLowerCase().startsWith("ticket")
      ) {
        if (!messageService) return;
        messageService.handleMessageInTicketCategory(message);
      }
      return;
    }

    if (message.embeds.length >= 1 && !message.author.bot) {
      if (message.embeds.filter(embed => embed.type === "rich").length > 0) {
        message.author.send("USE A SELFBOT 4HEAD - GG INSTABAN");
        message.member
          .ban()
          .then(member => {
            console.log(`[SELFBOT BAN] Tag: ${member.user.tag}`);
          })
          .catch(console.error);
      }
    }

    let a = Bot.isInDialogue(message.channel.id, message.author.id);
    if (a) return;

    // Message as clean text
    const text = message.cleanContent;

    // Log to console
    console.log(`[${message.author.tag}] ${text}`);

    // Add xp
    XpHandler.instance.IncreaseXpOnMessage(message);

    // Get ticket categoryproficiency
    let ticketCategory = GuildHelper.getChannelByName(
      "tickets"
    ) as CategoryChannel;

    // Check if discordMessage is sent in ticket category
    if ((message.channel as TextChannel).parent == ticketCategory) {
      // Handle messages for tickets
      if (!messageService) return;
      messageService.handleMessageInTicketCategory(message);
    }

    LuisCommandHandler.handle(text, message);

    // Handle commands
    if (text.startsWith(config.prefix)) {
      CommandHandler.handle(text, message);
    }
  }
}
