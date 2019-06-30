import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { DiscordUserProficiency, ProficiencyLevel } from "../models/proficiency/proficiency";
import { CommandData } from "../models/commandData";

export default class ClaimProficienciesCommand extends BaseCommand {

  readonly commandWords = ["claimproficiencies"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?claimProficiencies",
      description: "Here is some information about me, DapperBot",
      roles: ["admin", "happy to help"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public async process(commandData: CommandData): Promise<void> {
    const dontRemove = [
      "admin",
      "happy to help",
      "recruiter",
      "moderator",
      "dappercoding",
      "dapperweb",
      "dapperbot",
      "bots",
      "member",
      "glorious leader",
      "twitch subscriber",
      "nitro booster",
      "supporter",
      "discord server list",
      "youtube member",
      "weapons commissar",
      "patreon"
    ];
    const toRemove: Discord.Role[] = [];

    commandData.message.member.roles.forEach(x => {
      if (!dontRemove.includes(x.name.toLowerCase())) {
        toRemove.push(x);
      }
    });

    if (toRemove.length > 0) {
      await commandData.message.member.removeRoles(toRemove).catch(console.error);
    }

    new ApiRequestHandler()
      .requestAPIWithType<DiscordUserProficiency[]>(
        "GET",
        null,
        "https://api.dapperdino.co.uk/api/proficiency/GetProficienciesForDiscordUser/" +
        commandData.message.author.id,
        commandData.config
      )
      .then(proficiencies => {
        const addRoles: Discord.Role[] = [];
        const actualProficiencies = proficiencies.filter(x => x.proficiencyLevel != ProficiencyLevel.AbsoluteBeginner && x.proficiencyLevel != ProficiencyLevel.JustStarted);
        for (let i = 0; i < actualProficiencies.length; i++) {
          let proficiency = actualProficiencies[i];

          let role = commandData.message.guild.roles.find(
            x =>
              x.name.toLowerCase() == proficiency.proficiency.name.toLowerCase()
          );

          if (role) {
            addRoles.push(role);
          }
        }

        if (addRoles.length > 0) {
          commandData.message.member.addRoles(addRoles);
        }
      });
  }
}
