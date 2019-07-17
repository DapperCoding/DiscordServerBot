import { ConfigManager } from "../../configManager";
import { Client } from "discord.js";

export class BotErrorEvent {
  public static handle(client: Client, error: any) {
    console.log(`----- Bot errored ${error} -----`);

    let config = ConfigManager.GetConfig();

    client.login(config.token);
  }
}
