import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { XpHandler } from "../handlers/xpHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { ReceiveXp } from "../models/xp/receiveXp";
import { GenericRichEmbedPageHandler } from "../genericRichEmbedPageHandler";

export default class LevelCommand extends BaseCommand {
  readonly commandWords = ["leaderboard", "lb"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?leaderboard",
      description: "Shows the leaderboard based on xp"
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
  }

  public canUseCommand(roles: Discord.Role[]) {
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

  public async process(commandData: CommandData): Promise<void> {
    this.createLeaderboardEmbed(commandData.message).then(xpEmbed => {
      commandData.message.channel.send(xpEmbed).then(newMsg => {
        commandData.message.delete(0);
        (newMsg as Discord.Message).delete(5000);
      });
    });
  }

  private createLeaderboardEmbed(message: Discord.Message) {
    return new Promise<Discord.RichEmbed>(async (resolve, reject) => {
      let xpEmbed = new Discord.RichEmbed()
        .setTitle("The current top 100 based on xp")
        .setColor("#ff00ff");

      let sentMessage = (await message.channel.send(
        xpEmbed
      )) as Discord.Message;

      XpHandler.instance.getTop100().then(async levelData => {
        // React with possible reactions
        await sentMessage.react("◀");
        await sentMessage.react("▶");

        let itemHandler = (embed: Discord.RichEmbed, data: ReceiveXp[]) => {
          let i = 1;
          data.forEach(item => {
            const pageNumber = handler.GetPageNumber();
            const currentNumberInLeaderboard = (pageNumber - 1) * 5 + i;
            const member = message.guild.members.get(item.discordId);
            if (member) {
              embed.addField(
                `#${currentNumberInLeaderboard} ${member.user.username}`,
                `Lvl: ${item.level}, XP: ${item.xp}`,
                false
              );
            } else {
              embed.addField(
                `#${currentNumberInLeaderboard} ${item.username}`,
                `Lvl: ${item.level}, XP: ${item.xp}`,
                false
              );
            }
            i++;
          });

          return embed;
        };

        // Create actual handler
        let handler = new GenericRichEmbedPageHandler<ReceiveXp>(
          levelData,
          5,
          itemHandler,
          xpEmbed,
          sentMessage
        );

        handler.showPage();

        const filter = (
          reaction: Discord.MessageReaction,
          user: Discord.User
        ) =>
          // Check if emoji is ◀ or ▶
          (reaction.emoji.name === "◀" || reaction.emoji.name === "▶") &&
          // Check if reaction is added by command user
          user.id === message.author.id;

        // Create a new collector for the message,
        const collector = sentMessage.createReactionCollector(filter, {});

        // Will hit each time a reaction is collected
        collector.on("collect", r => {
          if (r.emoji.name === "◀") {
            handler.PreviousPage();
          } else if (r.emoji.name === "▶") {
            handler.NextPage();
          }

          // Loop over all users for this reaction
          r.users.forEach(user => {
            // Check if user isn't a bot
            if (!user.bot) {
              // remove reaction for use
              r.remove(user);
            }
          });
        });

        collector.on("end", collected => {
          let a = collected.first();
          if (a) a.message.delete(0);
        });
      });
    });
  }
}
