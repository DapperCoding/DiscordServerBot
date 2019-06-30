import { IBotCommandHelp } from '../api'
import * as discord from 'discord.js'
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';
import { ConnectHandler } from '../handlers/connectHandler';

export default class RegisterCommand extends BaseCommand {

    readonly commandWords = ["connect"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?connect codehere', description: 'Connect your discord to your website account. You can find your code on your profile page.' }
    }

    public canUseInChannel(channel: discord.TextChannel): boolean {
        return !channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(commandData: CommandData): Promise<void> {

        // if (msg.toLowerCase().trim() === "?connect") {
        //     let model = false;
        //     let dialogue = new connectDialogue(config, msgObj.channel as discord.TextChannel, msgObj.member, client);

        //     let connectStep: dialogueStep<boolean> = new dialogueStep<boolean>(
        //         model,
        //         dialogue.getConnectCode,
        //         "Enter your connect code:",
        //         "",
        //         "");

        //     let handler = new dialogueHandler([connectStep], model);

        //     await handler
        //     .getInput(msgObj.channel as discord.TextChannel, msgObj.member, config as IBotConfig)
        //     .then((connected) => {

        //     });
        // } else {
        //     new connectHandler(client, config)
        //     .registerDiscord(msgObj)
        //     .then()
        // }

        new ConnectHandler(commandData.client, commandData.config)
            .registerDiscord(commandData.message)
            .then()
    }
}