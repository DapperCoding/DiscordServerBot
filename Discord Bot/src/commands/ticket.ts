import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import * as fs from 'fs'
import { ticket } from '../models/ticket';
import { applicant } from '../models/applicant';
import { apiRequestHandler } from '../apiRequestHandler';
import { dialogueHandler, dialogueStep } from '../dialogueHandler';

export default class TicketCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\?ticket/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?ticket', description: 'Creates a ticket for you to fill in via the prompts' }
    }

    public init(bot: IBot, dataPath: string): void { }

    public isValid(msg: string): boolean {
        return this.CMD_REGEXP.test(msg)
    }

    cbFunc = (response: any, data: any, endEarly: any) => {
        if (data == null) {
            data = new Array<string>(response);
        }
        else {
            data.push(response);
        }
        console.log(data.join(", "))
        return [data, endEarly];
    };

    httpFunc = (response: any, data: any, ticketuser: any, config: any) => {
        let ticketObject: ticket = new ticket();
        ticketObject.Applicant = new applicant()

        ticketObject.Subject = data[0];
        ticketObject.Description = data[1];
        ticketObject.Applicant.Username = ticketuser.username;
        ticketObject.Applicant.DiscordId = ticketuser.id;

        new apiRequestHandler().RequestAPI("POST", ticketObject, 'https://dapperdinoapi.azurewebsites.net/api/ticket', config);

        return data;
    };

    public async process(msg: string, answer: IBotMessage, msgObj: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {

        let collectedInfo;
        //datacallback

        let test: dialogueStep = new dialogueStep("What is the Question?", "Question Successful", "Question Unsuccessful", this.cbFunc, collectedInfo);
        let test2: dialogueStep = new dialogueStep("What is the Answer?", "Answer Successful", "Answer Unsuccessful", this.cbFunc, collectedInfo);
        let test3: dialogueStep = new dialogueStep("Would you like to add a URL? (If so, type 'yes', otherwse type anything else)", "URL Successful", "URL Unsuccessful", this.cbFunc, collectedInfo);
        let test4: dialogueStep = new dialogueStep("What is the URL?)", "URL Successful", "URL Unsuccessful", this.cbFunc, collectedInfo);
        let test5: dialogueStep = new dialogueStep("What is the URL Mask?)", "URL Mask Successful", "URL Unsuccessful", this.cbFunc, collectedInfo);

        let handler = new dialogueHandler([test, test2, test3, test4, test5], collectedInfo);

        collectedInfo = await handler.GetInput(msgObj.channel as discord.TextChannel, msgObj.member, config as IBotConfig);

        let ticketEmbed = new discord.RichEmbed()
            .setTitle("Ticket Created Successfully!")
            .setColor('#ffdd05')
            .addField("Your Title:", collectedInfo[0], false)
            .addField("Your Description:", collectedInfo[1], false)
            .setFooter("Thank you for subitting a ticket " + msgObj.author.username + ". We'll try to get around to it as soon as possible, please be patient.")

        msgObj.delete(0);
        msgObj.channel.send(ticketEmbed);    
    }
}