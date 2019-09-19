import * as discord from "discord.js";
import { IBotCommandHelp, IBotConfig } from "../api";
import { Ticket } from "../models/ticket/ticket";
import { Applicant } from "../models/ticket/applicant";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { DialogueHandler, DialogueStep } from "../handlers/dialogueHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import {
  RecruiterDialogue,
  RecruiterDialogueData
} from "../dialogues/recruiterDialogue";
import { Proficiency } from "../models/proficiency/proficiency";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { Constants } from "../constants";

export default class TicketCommand extends BaseCommand {
  readonly commandWords = ["recruiter"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?recruiter",
      description: "Creates an application for the recruiter role."
    };
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    if (channel.parent.name.toLowerCase() !== "bot commands") return false;
    return channel.name.toLowerCase() === "applications";
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
        "Create your application"
      )) as discord.Message;
      commandData.message.channel.send(
        "Check your dms! You can continue creating your application there."
      );
    } catch (e) {
      commandData.message.channel.send(
        "Please use the web panel enable DMs to use this feature."
      );
      return;
    }
    // Array of collected info
    let collectedInfo = new RecruiterDialogueData();

    // Add discordMessage object for later use in apiCall
    this.setMessage(commandData.message);
    let d = new RecruiterDialogue();
    // Create category step
    let ageStep: DialogueStep<RecruiterDialogueData> = new DialogueStep(
      collectedInfo,
      d.ageStep,
      "Please enter your age."
    );

    // Create description step
    let motivationStep: DialogueStep<RecruiterDialogueData> = new DialogueStep(
      collectedInfo,
      d.motivationStep,
      "Why do you want to become a Recruiter?. (80 - 400 characters)"
    );

    let developmentExperience: DialogueStep<
      RecruiterDialogueData
    > = new DialogueStep(
      collectedInfo,
      d.developmentExperience,
      "What is your previous experience in software development? (80 - 400 characters)"
    );

    let developmentReviewingExperience: DialogueStep<
      RecruiterDialogueData
    > = new DialogueStep(
      collectedInfo,
      d.developmentReviewingExperience,
      "What is your previous experience in reviewing software? (80 - 400 characters)"
    );

    let recruitingExperience: DialogueStep<
      RecruiterDialogueData
    > = new DialogueStep(
      collectedInfo,
      d.recruitingExperience,
      "What is your previous experience in recruiting developers? (80 - 400 characters)"
    );

    let githubLinks: DialogueStep<RecruiterDialogueData> = new DialogueStep(
      collectedInfo,
      d.githubLinks,
      "What is the link to your github profile?"
    );

    let projectLinks: DialogueStep<RecruiterDialogueData> = new DialogueStep(
      collectedInfo,
      d.projectLinks,
      "What are some links to interesting software you have developed in the past?"
    );

    // Create new dialogueHandler with a titleStep and descriptionStep
    let handler = new DialogueHandler(
      [
        motivationStep,
        recruitingExperience,
        developmentExperience,
        developmentReviewingExperience,
        githubLinks,
        projectLinks,
        ageStep
      ],
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
        data.discordDiscordId = commandData.message.author.id;

        new ApiRequestHandler(commandData.client)
          .requestAPIWithType("POST", data, "forms/recruiter/add")
          .then(x => {
            let applicationEmbed = new discord.RichEmbed()
              .setTitle("Application Created Successfully!")
              .setColor(Constants.EmbedColors.GREEN)
              .addField("Age:", data.age, false)
              .addField("Your Motivation:", data.motivation, false)
              .addField("GitHub Link(s):", data.githubLink, false)
              .addField("Project Link(s):", data.projectLinks, false)
              .addField(
                "Your Recruiting Experience:",
                data.recruitingExperience,
                false
              )
              .addField(
                "Your Development Reviewing Experience:",
                data.developmentReviewingExperience,
                false
              )
              .addField(
                "Your Development Experience:",
                data.developmentExperience,
                false
              )
              .setFooter(
                "Thanks for being patient while we revamp our systems."
              );

            // Send ticketEmbed
            commandData.message.author.send(applicationEmbed);
          });
      });
  }
}
