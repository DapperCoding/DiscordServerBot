import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import { xpHandler } from '../handlers/xpHandler';
import { connectHandler } from '../handlers/connectHandler';
import { connectDialogue } from '../dialogues/connectDialogue';
import { dialogueStep, dialogueHandler } from '../handlers/dialogueHandler';
import BaseCommand from '../baseCommand';

export default class DescriptionCommand extends BaseCommand {
    constructor(){
        super(/^\?description/im);
    }

    public getHelp(): IBotCommandHelp {
        return { caption: '?description', description: 'Connect your discord to your website account. You can find your code on your profile page.' }
    }

    public init(bot: IBot, dataPath: string): void { }

    public canUseInChannel(channel:discord.TextChannel): boolean {
        return channel.name.toLowerCase().startsWith("ticket");
    }

    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        /*
        if (msg.toLowerCase().trim() !== "?connect") {
            let model = false;
            let dialogue = new connectDialogue(config, msgObj.channel as discord.TextChannel, msgObj.member, client);

            let connectStep: dialogueStep<boolean> = new dialogueStep<boolean>(
                model,
                dialogue.getConnectCode,
                "Enter your connect code:",
                "",
                "");
    
            let handler = new dialogueHandler([connectStep], model);
    
            await handler
            .getInput(msgObj.channel as discord.TextChannel, msgObj.member, config as IBotConfig)
            .then((connected) => {
                
            });
        } else {
            new connectHandler(client, config)
            .registerDiscord(msgObj)
            .then()
        }*/
        
    }
}