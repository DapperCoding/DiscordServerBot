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
    if (Bot.isInDialogue(message.channel.id, message.author.id)) return;

    const config = ConfigManager.GetConfig();
    // Make sure that the bot isn't responding to itself
    const messageService = ServiceHelper.getMessageService();
    const textChannel = message.channel as TextChannel;
    if (message.channel.type === "dm") {
      return;
    } else if (textChannel.name.toLowerCase().startsWith("ticket")) {
      if (!messageService) return;
      messageService.handleMessageInTicketCategory(message);
    }

    if (
      textChannel.parent &&
      textChannel.parent.name.toLowerCase() === "interviews"
    ) {
      if (!messageService) return;
      messageService.handleMessageInInterviewChannel(message);
    }

    if (message.author.bot) {
      return;
    }

    // Message as clean text
    const text = message.cleanContent;

    // Log to console
    console.log(`[${message.author.tag}] ${text}`);

    // Add xp
    XpHandler.instance.IncreaseXpOnMessage(message);

    LuisCommandHandler.handle(text, message);

    // Handle commands
    if (text.startsWith(config.prefix)) {
      CommandHandler.handle(text, message);
    }
  }
}
