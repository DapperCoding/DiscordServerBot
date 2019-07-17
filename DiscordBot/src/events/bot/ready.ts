import { Client, Guild, TextChannel } from "discord.js";
import { ClientHelper } from "../../helpers/clientHelper";
import { IBotConfig } from "../../api";
import { GuildHelper } from "../../helpers/guildHelper";
import { ServiceHelper } from "../../helpers/serviceHelper";
import { WebsiteBotService } from "../../services/websiteBotService";
import { ApiBotService } from "../../services/apiBotService";
import { ChannelHelper } from "../../helpers/channelHelper";
import { MessageService } from "../../services/messageService";
import { ApiRequestHandler } from "../../handlers/apiRequestHandler";

export class ReadyEvent {
  private static hasApiConnection = false;
  public static handle(logger: any, client: Client, config: IBotConfig) {
    // Bot is now ready
    logger.info("started...");

    ClientHelper.setClient(client);

    // Set bot activity
    client.user.setActivity("?commands | With Dapper Dino", {
      type: "PLAYING"
    });

    // Set status to online
    client.user.setStatus("online");

    // Get server by id, from config files
    GuildHelper.setGuild(
      client.guilds.find(guild => guild.id === config.serverId)
    );

    const server = GuildHelper.getGuild() as Guild;

    // Get commonly used channels from server
    ChannelHelper.setWelcomeChannel(server.channels.find(
      channel => channel.name === "welcome"
    ) as TextChannel);
    ChannelHelper.setFaqChannel(server.channels.find(
      channel => channel.name === "f-a-q"
    ) as TextChannel);

    if (!ReadyEvent.hasApiConnection) {
      // Create new website bot service & startup
      ServiceHelper.setWebsiteService(new WebsiteBotService(client, server));
      (ServiceHelper.getWebsiteService() as WebsiteBotService).startupService();

      // Create new api bot service & startup
      ServiceHelper.setApiService(new ApiBotService(client, server));
      (ServiceHelper.getApiService() as ApiBotService).startupService();

      ReadyEvent.hasApiConnection = true;
    }

    // Create new discordMessage service
    ServiceHelper.setMessageService(new MessageService(client, config));

    //Regenerate bearer token
    new ApiRequestHandler().generateNewToken(config);
  }
}
