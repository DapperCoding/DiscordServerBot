import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import * as discord from "discord.js";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import { ticket } from "../models/ticket/ticket";

export default class RegisterCommand implements IBotCommand {
  private readonly CMD_REGEXP = /^\?info/im;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?info in ticket channel",
      description: "Use this command in any ticket channel to get information."
    };
  }

  public init(bot: IBot, dataPath: string): void {}

  public isValid(msg: string): boolean {
    return this.CMD_REGEXP.test(msg);
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return channel.name.toLowerCase().startsWith("ticket");
  }

  public canUseCommand(roles: discord.Role[]) {
    let helpObj: IBotCommandHelp = this.getHelp();
    let canUseCommand = true;

    if (helpObj.roles != null && helpObj.roles.length > 0) {
      canUseCommand = false;

      for (var cmdRole in helpObj.roles) {
        if (
          roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase())
        )
          canUseCommand = true;
      }
    }

    return canUseCommand;
  }

  public async process(
    msg: string,
    answer: IBotMessage,
    msgObj: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[]
  ): Promise<void> {
    let curChannel = msgObj.channel as discord.TextChannel;
    let id = curChannel.name.toLowerCase().replace("ticket", "");

    new apiRequestHandler(client, config)
      .requestAPIWithType<ticket>(
        "GET",
        null,
        `https://api.dapperdino.co.uk/api/ticket/${id}`,
        config
      )
      .then(ticket => {
        // Add ticket info
        let ticketEmbed = new discord.RichEmbed()
          .setTitle("Subject: " + ticket.subject + ".")
          .setColor("#ffdd05")
          .addField("Description:", ticket.description + ".")
          .setFooter("Thanks for all your help :)");

        curChannel.send(ticketEmbed);
      })
      .catch(err => console.error(err));
  }
}
