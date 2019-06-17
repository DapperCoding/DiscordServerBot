import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import { getRandomInt } from "../utils";
import * as discord from "discord.js";
import { apiRequestHandler } from "../handlers/apiRequestHandler";

export default class CountTicketsCommand implements IBotCommand {
  public canUseCommand(roles: discord.Role[]) {
    let helpObj: IBotCommandHelp = this.getHelp();
    let canUseCommand = true;

    if (helpObj.roles != null && helpObj.roles.length > 0) {
      canUseCommand = false;

      for (var i = 0; i < helpObj.roles.length; i++) {
        var cmdRole = helpObj.roles[i];
        if (
          roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase())
        )
          canUseCommand = true;
      }
    }

    return canUseCommand;
  }
  private readonly CMD_REGEXP = /^\?counttickets/im;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?countTickets",
      description:
        "Sends an embed in the current channel with the open ticket count",
      roles: ["admin", "happy to help"]
    };
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public init(bot: IBot, dataPath: string): void {}

  public isValid(msg: string): boolean {
    return this.CMD_REGEXP.test(msg.toLowerCase());
  }

  public async process(
    msg: string,
    answer: IBotMessage,
    message: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[]
  ): Promise<void> {
    new apiRequestHandler(client, config)

      // Set params for requestAPI
      .requestAPIWithType<
        { id: number; count: number; subject: string; description: string }[]
      >("GET", null, `https://api.dapperdino.co.uk/api/ticket/opentickets`, config)

      // When everything went right, we receive a ticket back, so we add the h2h-er to the ticket channel
      .then(tickets => {
        let embed = new discord.RichEmbed()
          .setColor("#ff0000")
          .setTitle(`There's currently ${tickets.length} open tickets`);

        message.channel.send(embed);
      });
  }
}
