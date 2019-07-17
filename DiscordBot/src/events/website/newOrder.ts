import { TextChannel, Guild } from "discord.js";

export class NewOrderEvent {
  public static handle(server: Guild, order: any) {
    let channel = server.channels.find(
      x => x.name.toLowerCase() == "dapper-coding"
    ) as TextChannel;

    if (channel) {
      channel.send(`New order with id ${order.id}`);
    }
  }
}
