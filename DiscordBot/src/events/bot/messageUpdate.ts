import { Message, TextChannel, GuildChannel } from "discord.js";
import { ServiceHelper } from "../../helpers/serviceHelper";
import { XpHandler } from "../../handlers/xpHandler";
import { ConfigManager } from "../../configManager";
import { LuisCommandHandler } from "../../handlers/luisCommandHandler";
import { CommandHandler } from "../../handlers/commandHandler";

export class MessageUpdateEvent {
  public static handle(message: Message) {
    const config = ConfigManager.GetConfig();
    const textChannel = message.channel as TextChannel;
    const messageService = ServiceHelper.getMessageService();
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

    // Add xp
    XpHandler.instance.IncreaseXpOnMessage(message);

    LuisCommandHandler.handle(message.content, message);

    // Handle commands
    if (message.content.startsWith(config.prefix)) {
      CommandHandler.handle(message.content, message);
    }
  }
}
