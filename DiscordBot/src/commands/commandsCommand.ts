import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { GenericRichEmbedPageHandler } from "../genericRichEmbedPageHandler";
import { CommandData } from "../models/commandData";
import BaseCommand from "../baseCommand";
import { BotCommand } from "../models/botCommand";

export default class CommandsCommand extends BaseCommand {

  readonly commandWords = ["commands"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?commands",
      description:
        "Sends you a list of all our commands, that'ts how you got here in the first place"
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
    let embed = new Discord.RichEmbed()
      .setTitle("Here is a list of all our commands")
      .setDescription("Use the arrow buttons to page through the commands")
      .setFooter("You'll have to manually remove the reaction to be able to click use the reaction again")
      .setColor("#ff0000");

    commandData.message.author.send(embed).then(async message => {
      // TypeScript hack for sending a single message
      if (Array.isArray(message)) {
        message = message[0];
      }

      // React with possible reactions
      await message.react("◀");
      await message.react("▶");

      let itemHandler = (embed: Discord.RichEmbed, data: BotCommand[]) => {
        data.forEach(item => {
          let helpObj = item.getHelp();

          if (item.canUseCommand(commandData.message.member.roles.array())) {
            embed.addField(helpObj.caption, helpObj.description, false);
          }
        });

        return embed;
      };

      // Create actual handler
      let handler = new GenericRichEmbedPageHandler<BotCommand>(
        commandData.commands,
        5,
        itemHandler,
        embed,
        message as Discord.Message
      );

      handler.showPage();

      const filter = (reaction: Discord.MessageReaction, user: Discord.User) =>
        // Check if emoji is ◀ or ▶
        (reaction.emoji.name === "◀" || reaction.emoji.name === "▶") &&
        // Check if reaction is added by command user
        user.id === commandData.message.author.id;

      // Create a new collector for the message,
      const collector = message.createReactionCollector(filter, {
        time: 60 * 1000
      });

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

    let confirmationEmbed = new Discord.RichEmbed()
      .setTitle("Hello " + commandData.message.author.username)
      .setColor("#ff0000")
      .addField(
        "I've just sent you a pm with all the server's commands",
        "I hope you enjoy your time here and make the most out of me, DapperBot",
        false
      );

    commandData.message.channel.send(confirmationEmbed).then(newMsg => {
      commandData.message.delete(0);
      (newMsg as Discord.Message).delete(5000);
    });
  }
}
