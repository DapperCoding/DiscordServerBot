import { ConfigManager } from "../../configManager";
import { Client } from "discord.js";

export class DisconnectEvent {
  public static handle(client: Client, code: any, erMsg: any) {
    console.log(
      "----- Bot disconnected from Discord with code",
      code,
      "for reason:",
      erMsg,
      "-----"
    );

    let config = ConfigManager.GetConfig();

    client.login(config.token);
  }
}
