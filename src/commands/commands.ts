import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import * as discord from "discord.js";
import { GenericRichEmbedPageHandler } from "../genericRichEmbedPageHandler";

export default class CommandsCommand implements IBotCommand {
  private readonly CMD_REGEXP = /^\?commands/im;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?commands",
      description:
        "Sends you a list of all our commands, that'ts how you got here in the first place"
    };
  }

  public init(bot: IBot, dataPath: string): void {}

  public isValid(msg: string): boolean {
    return this.CMD_REGEXP.test(msg);
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return !channel.name.toLowerCase().startsWith("ticket");
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
    msgObject: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[]
  ): Promise<void> {
    let embed = new discord.RichEmbed()
      .setTitle("Here is a list of all our commands")
      .setDescription("Use the arrow buttons to page through the commands")
      .setFooter("You'll have to manually remove the reaction to be able to click use the reaction again")
      .setColor("#ff0000");

    msgObject.author.send(embed).then(async message => {
      // TypeScript hack for sending a single message
      if (Array.isArray(message)) {
        message = message[0];
      }

      // React with possible reactions
      await message.react("◀");
      await message.react("▶");

      let itemHandler = (embed: discord.RichEmbed, data: IBotCommand[]) => {
        data.forEach(item => {
          let helpObj = item.getHelp();

          if (item.canUseCommand(msgObject.member.roles.array())) {
            embed.addField(helpObj.caption, helpObj.description, false);
          }
        });

        return embed;
      };

      // Create actual handler
      let handler = new GenericRichEmbedPageHandler<IBotCommand>(
        commands,
        5,
        itemHandler,
        embed,
        message as discord.Message
      );

      handler.showPage();

      const filter = (reaction: discord.MessageReaction, user: discord.User) =>
        // Check if emoji is ◀ or ▶
        (reaction.emoji.name === "◀" || reaction.emoji.name === "▶") &&
        // Check if reaction is added by command user
        user.id === msgObject.author.id;

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

    let confirmationEmbed = new discord.RichEmbed()
      .setTitle("Hello " + msgObject.author.username)
      .setColor("#ff0000")
      .addField(
        "I've just sent you a pm with all the server's commands",
        "I hope you enjoy your time here and make the most out of me, DapperBot",
        false
      );
    msgObject.channel.send(confirmationEmbed).then(newMsg => {
      msgObject.delete(0);
      (newMsg as discord.Message).delete(5000);
    });
  }
}
