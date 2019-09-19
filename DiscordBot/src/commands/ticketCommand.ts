import * as discord from "discord.js";
import { IBotCommandHelp, IBotConfig } from "../api";
import { Ticket } from "../models/ticket/ticket";
import { Applicant } from "../models/ticket/applicant";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { DialogueHandler, DialogueStep } from "../handlers/dialogueHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import {
  TicketDialogueData,
  TicketDialogue
} from "../dialogues/ticketDialogue";
import { TicketProficiencyDialogue } from "../dialogues/ticketProficiencyDialogue";
import { Proficiency } from "../models/proficiency/proficiency";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { Constants } from "../constants";

export default class TicketCommand extends BaseCommand {
  readonly commandWords = ["help"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?help",
      description: "Creates a ticket for you to fill in via the prompts"
    };
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

  public async process(commandData: CommandData): Promise<void> {
    let dm = {} as discord.Message;
    try {
      dm = (await commandData.message.author.send(
        "Create your ticket"
      )) as discord.Message;
      commandData.message.channel.send(
        "Check your dms! You can continue creating a ticket in your dms."
      );
    } catch (e) {
      commandData.message.channel.send(
        "Please use the web portal or enable dms to use this feature."
      );
      return;
    }
    // Array of collected info
    let collectedInfo = new TicketDialogueData();

    // Add discordMessage object for later use in apiCall
    this.setMessage(commandData.message);
    let d = new TicketDialogue();
    // Create category step
    let titleStep: DialogueStep<TicketDialogueData> = new DialogueStep(
      collectedInfo,
      d.titleStep,
      "Enter a title for your ticket that quickly summarises what you are requiring assistance with: (20 - 100)",
      "Title Successful",
      "Title Unsuccessful"
    );

    // Create description step
    let descriptionStep: DialogueStep<TicketDialogueData> = new DialogueStep(
      collectedInfo,
      d.descriptionStep,
      "Enter a description for your ticket. Please be as descriptive as possible so that whoever is assigned to help you knows in depth what you are struggling with: (60 - 700)",
      "Description Successful",
      "Description Unsuccessful"
    );

    // Create new dialogueHandler with a titleStep and descriptionStep
    let handler = new DialogueHandler(
      [titleStep, descriptionStep],
      collectedInfo
    );

    // Collect info from steps
    await handler
      .getInput(
        dm.channel as discord.DMChannel,
        commandData.message.author,
        false
      )
      .then(async data => {
        // TODO: Create reaction handlers
        let reactionHandler = new TicketProficiencyDialogue();

        let language = await reactionHandler.SelectLanguage(
          commandData.client,
          dm.channel as discord.DMChannel,
          commandData.message.author.id
        );
        let framework = await reactionHandler.SelectFramework(
          commandData.client,
          dm.channel as discord.DMChannel,
          commandData.message.author.id
        );

        //API CALL
        this.apiCall(data, language, framework, commandData.message.member);

        // Create proficiency embed
        let ticketEmbed = new discord.RichEmbed()
          .setTitle("Ticket Created Successfully!")
          .setColor(Constants.EmbedColors.GREEN)
          .addField("Title:", data.title, false)
          .addField("Description:", data.description, false)
          .setFooter("With ❤ the DapperCoding team");

        // Send ticketEmbed
        commandData.message.author.send(ticketEmbed);
      });
  }

  apiCall = (
    data: TicketDialogueData,
    language: Proficiency,
    framework: Proficiency,
    ticketuser: any
  ) => {
    // Create new proficiency object
    let ticketObject: Ticket = new Ticket();

    // Create new applicant object
    ticketObject.applicant = new Applicant();

    // Fill properties of proficiency
    ticketObject.subject = data.title;
    ticketObject.description = data.description;

    // Fill properties of applicant
    ticketObject.applicant.username = ticketuser.displayName;
    ticketObject.applicant.discordId = ticketuser.id;
    ticketObject.languageId;
    ticketObject.frameworkId = framework.id;
    ticketObject.languageId = language.id;

    // Post request to /ticket/
    new ApiRequestHandler()

      // Create request and fill params
      .requestAPI("POST", ticketObject, "ticket")

      // If everything went well, we receive a ticketReceive object
      .then(value => {
        // Parse object
        var ticket = JSON.parse(JSON.stringify(value)) as TicketReceive;

        console.log(ticket);
      });

    return data;
  };
}
