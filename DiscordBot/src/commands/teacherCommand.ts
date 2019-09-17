import * as discord from "discord.js";
import { IBotCommandHelp, IBotConfig } from "../api";
import { Ticket } from "../models/ticket/ticket";
import { Applicant } from "../models/ticket/applicant";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { DialogueHandler, DialogueStep } from "../handlers/dialogueHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import {
  TeacherDialogueData,
  TeacherDialogue
} from "../dialogues/teacherDialogue";
import { Proficiency } from "../models/proficiency/proficiency";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class TicketCommand extends BaseCommand {
  readonly commandWords = ["teacher"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?teacher",
      description: "Creates an application for the teacher role."
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
    let collectedInfo = new TeacherDialogueData();

    // Add discordMessage object for later use in apiCall
    this.setMessage(commandData.message);
    let d = new TeacherDialogue();
    // Create category step
    let ageStep: DialogueStep<TeacherDialogueData> = new DialogueStep(
      collectedInfo,
      d.ageStep,
      "Please enter your age."
    );

    // Create description step
    let motivationStep: DialogueStep<TeacherDialogueData> = new DialogueStep(
      collectedInfo,
      d.motivationStep,
      "Enter a short overview of what motivates you. (60 - 200 characters)"
    );

    let developmentExperience: DialogueStep<
      TeacherDialogueData
    > = new DialogueStep(
      collectedInfo,
      d.developmentExperience,
      "Enter a short overview of your development experience. (60 - 200 characters)"
    );

    let githubLinks: DialogueStep<TeacherDialogueData> = new DialogueStep(
      collectedInfo,
      d.githubLinks,
      "Enter 1 or more GitHub profile links."
    );

    let projectLinks: DialogueStep<TeacherDialogueData> = new DialogueStep(
      collectedInfo,
      d.projectLinks,
      "Enter 1 or more previous project links."
    );

    let teachingExperience: DialogueStep<
      TeacherDialogueData
    > = new DialogueStep(
      collectedInfo,
      d.teachingExperience,
      "Enter your previous teaching experience. (60 - 200 characters)"
    );

    // Create new dialogueHandler with a titleStep and descriptionStep
    let handler = new DialogueHandler(
      [
        ageStep,
        motivationStep,
        developmentExperience,
        githubLinks,
        projectLinks,
        teachingExperience
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
          .requestAPIWithType("POST", data, "forms/teacher/add")
          .then(x => {
            let applicationEmbed = new discord.RichEmbed()
              .setTitle("Application Created Successfully!")
              .setColor("#ffdd05")
              .addField("Age:", data.age, false)
              .addField("Your Motivation:", data.motivation, false)
              .addField("Your Project Link(s):", data.projectLinks, false)
              .addField("Your GitHub Link(s):", data.githubLink, false)
              .addField(
                "Your Previous Teaching Experience:",
                data.teachingExperience,
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
