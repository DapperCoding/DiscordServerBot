import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import { getRandomInt } from "../utils";
import * as discord from "discord.js";
import * as fs from "fs";
import { ticket } from "../models/ticket/ticket";
import { applicant } from "../models/ticket/applicant";
import { apiRequestHandler } from "../handlers/apiRequestHandler";
import { dialogueHandler, dialogueStep } from "../handlers/dialogueHandler";
import { ticketReceive } from "../models/ticket/ticketReceive";
import { channelhandler } from "../handlers/channelHandler";
import { websiteBotService } from "../services/websiteBotService";
import {
  ticketDialogueData,
  ticketDialogue
} from "../dialogues/ticketDialogue";
import { TicketProficiencyDialogue } from "../dialogues/TicketProficiencyDialogue";
import { proficiency } from "../models/proficiency/proficiency";

export default class TicketCommand implements IBotCommand {
  private readonly CMD_REGEXP = /^\?(help?|ticket?|createticket)/im;

  private _guild;

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?help",
      description: "Creates a ticket for you to fill in via the prompts"
    };
  }

  public init(bot: IBot, dataPath: string): void {}

  public isValid(msg: string): boolean {
    let b = this.CMD_REGEXP.test(msg.toLowerCase());

    return b;
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    if (channel.parent.name.toLowerCase() !== "bot commands") return false;
    return (
      channel.name.toLowerCase() === "create-ticket" ||
      channel.name.toLocaleLowerCase() === "help"
    );
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

  private dMessage: discord.Message | null = null;

  private setMessage(msg: discord.Message) {
    this.dMessage = msg;
  }

  private getMessage(): discord.Message | null {
    return this.dMessage;
  }

  public async process(
    messageContent: string,
    answer: IBotMessage,
    message: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[],
    wbs: websiteBotService,
    guild: discord.Guild
  ): Promise<void> {
    this._guild = guild;

    // Array of collected info
    let collectedInfo = new ticketDialogueData();

    // Add discordMessage object for later use in apiCall
    this.setMessage(message);
    let d = new ticketDialogue();
    // Create category step
    let titleStep: dialogueStep<ticketDialogueData> = new dialogueStep(
      collectedInfo,
      d.titleStep,
      "Enter a title for your ticket that quickly summarises what you are requiring assistance with: (20 - 100)",
      "Title Successful",
      "Title Unsuccessful"
    );

    // Create description step
    let descriptionStep: dialogueStep<ticketDialogueData> = new dialogueStep(
      collectedInfo,
      d.descriptionStep,
      "Enter a description for your ticket. Please be as descriptive as possible so that whoever is assigned to help you knows in depth what you are struggling with: (60 - 700)",
      "Description Successful",
      "Description Unsuccessful"
    );

    // Create new dialogueHandler with a titleStep and descriptionStep
    let handler = new dialogueHandler(
      [titleStep, descriptionStep],
      collectedInfo
    );

    // Add current message for if the user cancels the dialogue
    handler.addRemoveMessage(message);

    // Collect info from steps
    await handler
      .getInput(
        message.channel as discord.TextChannel,
        message.member,
        config as IBotConfig
      )
      .then(async data => {
        // TODO: Create reaction handlers
        let reactionHandler = new TicketProficiencyDialogue();

        let language = await reactionHandler.SelectLanguage(message, config);
        let framework = await reactionHandler.SelectFramework(message, config);

        //API CALL
        this.apiCall(data, language, framework, message.member, config);

        // Create proficiency embed
        let ticketEmbed = new discord.RichEmbed()
          .setTitle("Ticket Created Successfully!")
          .setColor("#ffdd05")
          .addField("Your Title:", data.title, false)
          .addField("Your Description:", data.description, false)
          .setFooter(
            "Happy new year everyone! Please expect some delay in ticket handling this holiday season."
          );

        // Send ticketEmbed
        message.channel.send(ticketEmbed);
      });
  }

  apiCall = (
    data: ticketDialogueData,
    language: proficiency,
    framework: proficiency,
    ticketuser: any,
    config: any
  ) => {
    // Create new proficiency object
    let ticketObject: ticket = new ticket();

    // Create new applicant object
    ticketObject.applicant = new applicant();

    // Fill properties of proficiency
    ticketObject.subject = data.title;
    ticketObject.description = data.description;

    // Fill properties of applicant
    ticketObject.applicant.username = ticketuser.displayName;
    ticketObject.applicant.discordId = ticketuser.id;
    ticketObject.languageId;
    ticketObject.frameworkId = framework.id;
    ticketObject.languageId = language.id;

    // Post request to /api/Ticket/
    new apiRequestHandler()

      // Create request and fill params
      .requestAPI(
        "POST",
        ticketObject,
        "https://api.dapperdino.co.uk/api/ticket",
        config
      )

      // If everything went well, we receive a ticketReceive object
      .then(value => {
        // Parse object
        var ticket = JSON.parse(JSON.stringify(value)) as ticketReceive;

        console.log(ticket);
      });

    return data;
  };
}
