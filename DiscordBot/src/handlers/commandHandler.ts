import * as path from "path";
import * as fs from "fs";

import { BotCommand } from "../models/botCommand";
import { IBot } from "../api";
import { CommandData } from "../models/commandData";
import { BotMessage } from "../botMessage";
import { ClientHelper } from "../helpers/clientHelper";
import { Client, TextChannel, Guild } from "discord.js";
import { GuildHelper } from "../helpers/guildHelper";
import { ServiceHelper } from "../helpers/serviceHelper";
import { WebsiteBotService } from "../services/websiteBotService";
import { ConfigManager } from "../configManager";

export class CommandHandler {
  private static commands: BotCommand[] = [];

  public static getCommands = () => CommandHandler.commands;
  public static setCommands = commands => (CommandHandler.commands = commands);

  public static async handle(text, message) {
    // Check if discordMessage is a command
    for (const cmd of CommandHandler.commands) {
      try {
        // Validate cmd regex, if not valid, go to the next cmd
        if (!cmd.isValid(text, ConfigManager.GetConfig())) {
          continue;
        }

        // Validate roles
        if (!cmd.canUseCommand(message.member.roles.array())) {
          continue;
        }

        // Validate channel
        if (!cmd.canUseInChannel(message.channel as TextChannel)) {
          continue;
        }

        // Create new bot discordMessage for our response
        const answer = new BotMessage(message.author);

        let commandData = new CommandData();
        commandData.message = message;
        commandData.client = ClientHelper.getClient() as Client;
        commandData.guild = GuildHelper.getGuild() as Guild;
        commandData.commands = this.commands;
        commandData.webBotService = ServiceHelper.getWebsiteService() as WebsiteBotService;

        // Await processing of cmd
        await cmd.process(commandData);

        // Check if response is valid
        if (answer.isValid()) {
          // Send text or embed
          message.channel
            .send(answer.text || { embed: answer.richText })
            .then(console.log)
            .catch(console.error);
        }
      } catch (ex) {
        // Log errors
        console.error(ex);
      }
    }
  }

  // Loads all commands
  public static loadCommands(
    bot: IBot,
    commandsPath: string,
    dataPath: string
  ) {
    fs.readdir(`${commandsPath}/`, (err, files) => {
      if (err) {
        return console.error(err);
      }

      files.forEach(file => {
        // Load the file at the given path
        let commandClass = require(`${commandsPath}/${file}`).default;

        // Cast the file to be a bot command
        let command = new commandClass() as BotCommand;

        // Initialize command
        command.init(bot, path.resolve(`${dataPath}/${file}`));

        // Add to commands list
        CommandHandler.commands.push(command);

        // Inform that command has been loaded
        console.log(`command "${file}" loaded...`);
      });
    });
  }
}
