import * as Discord from 'discord.js'
import { IBot, IBotCommandHelp, IBotConfig } from '../api'
import { ConnectHandler } from '../handlers/connectHandler';
import { ConnectDialogue } from '../dialogues/connectDialogue';
import { DialogueStep, DialogueHandler } from '../handlers/dialogueHandler';
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class ConnectCommand extends BaseCommand {

    readonly commandWords = ["connect"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?connect codehere', description: 'Connect your discord to your website account. You can find your code on your profile page.' }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return !channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(commandData: CommandData): Promise<void> {

        if (commandData.message.content.toLowerCase().trim() === "?connect") {
            let model = false;
            let dialogue = new ConnectDialogue(
                commandData.config,
                commandData.message.channel as Discord.TextChannel,
                commandData.message.member, commandData.client);

            let connectStep: DialogueStep<boolean> = new DialogueStep<boolean>(
                model,
                dialogue.getConnectCode,
                "Enter your connect code:",
                "",
                "");

            let handler = new DialogueHandler([connectStep], model);

            await handler
                .getInput(
                    commandData.message.channel as Discord.TextChannel,
                    commandData.message.member,
                    commandData.config as IBotConfig)
                .then((connected) => {

                });
        } else {
            new ConnectHandler(commandData.client, commandData.config)
                .registerDiscord(commandData.message)
                .then()
        }
    }
}