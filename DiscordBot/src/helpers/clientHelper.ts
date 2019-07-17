import { Client } from "discord.js";

export class ClientHelper {
  private static client: Client | null = null;

  public static setClient(client: Client) {
    this.client = client;
  }

  public static getClient() {
    return this.client;
  }
}
