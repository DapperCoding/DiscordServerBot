import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import { getRandomInt } from "../utils";
import * as discord from "discord.js";
import BaseCommand from "../baseCommand";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import { discordUserProficiency } from "../models/proficiency/proficiency";
import { message } from "../models/message";

export default class ClaimProficienciesCommand extends BaseCommand {
  constructor() {
    super(/^\?claimproficiencies/im);
  }

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?claimProficiencies",
      description: "Here is some information about me, DapperBot",
      roles: ["admin", "happy to help"]
    };
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public init(bot: IBot, dataPath: string): void {}

  public async process(
    msg: string,
    answer: IBotMessage,
    msgObj: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[]
  ): Promise<void> {
    const dontRemove = [
      "admin",
      "happy to help",
      "recruiter",
      "moderator",
      "dapper coding",
      "dapperweb",
      "dapperbot",
      "bots",
      "member"
    ];
    const toRemove: discord.Role[] = [];

    msgObj.member.roles.forEach(x => {
      if (!dontRemove.includes(x.name.toLowerCase())) {
        toRemove.push(x);
      }
    });

    if (toRemove.length > 0) {
      msgObj.member.removeRoles(toRemove);
    }

    new apiRequestHandler()
      .requestAPIWithType<discordUserProficiency[]>(
        "GET",
        null,
        "https://api.dapperdino.co.uk/api/proficiency/GetProficienciesForDiscordUser/" +
          msgObj.author.id,
        config
      )
      .then(proficiencies => {
        const addRoles: discord.Role[] = [];
        for (let i = 0; i < proficiencies.length; i++) {
          let proficiency = proficiencies[i];

          let role = msgObj.guild.roles.find(
            x =>
              x.name.toLowerCase() == proficiency.proficiency.name.toLowerCase()
          );

          if (role) {
            addRoles.push(role);
          }
        }

        if (addRoles.length > 0) {
          msgObj.member.addRoles(addRoles);
        }
      });
  }
}
