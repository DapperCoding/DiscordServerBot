import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { Faq } from "../models/faq/faq";
import { DialogueHandler, DialogueStep } from "../handlers/dialogueHandler";
import { FaqDialogue } from "../dialogues/faqDialogue";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import {
  CommissionFormModel,
  CommissionForm
} from "../models/forms/commissionForm";
import {
  CommissionDialogueData,
  CommissionDialogue
} from "../dialogues/commissionDialogue";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";

export default class AddFaqCommand extends BaseCommand {
  readonly commandWords = ["commission"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?commission",
      description: "Create a request for a commission by the dapper coding team"
    };
  }

  public canUseInChannel(): boolean {
    return true;
  }

  public async process(commandData: CommandData): Promise<void> {
    let dialogueData = new CommissionDialogueData();
    let dialogue = new CommissionDialogue();

    let nameStep: DialogueStep<CommissionDialogueData> = new DialogueStep<
      CommissionDialogueData
    >(
      dialogueData,
      dialogue.nameStep,
      "Enter the name for your project (max 16 chars)",
      "Question Successful",
      "Question Unsuccessful"
    );

    let descriptionStep: DialogueStep<
      CommissionDialogueData
    > = new DialogueStep<CommissionDialogueData>(
      dialogueData,
      dialogue.descriptionStep,
      "Describe your project",
      "Answer Successful",
      "Answer Unsuccessful"
    );

    let functionalitiesStep: DialogueStep<
      CommissionDialogueData
    > = new DialogueStep(
      dialogueData,
      dialogue.functionalitiesStep,
      "Describe the functionalities of your project",
      "URL Choice Successful",
      "URL Choice Unsuccessful"
    );

    let budgetStep: DialogueStep<CommissionDialogueData> = new DialogueStep(
      dialogueData,
      dialogue.budgetStep,
      "Provide us some information about the budget for this project",
      "URL Choice Successful",
      "URL Choice Unsuccessful"
    );

    let handler = new DialogueHandler(
      [nameStep, descriptionStep, functionalitiesStep, budgetStep],
      dialogueData
    );

    await handler
      .getInput(
        commandData.message.channel as Discord.TextChannel,
        commandData.message.author
      )
      .then(output => {
        let commissionForm = new CommissionFormModel();

        commissionForm.name = output.name;
        commissionForm.description = output.description;
        commissionForm.functionalitites = output.functionalitites;
        commissionForm.budget = output.budget;

        commissionForm.discordDiscordId = commandData.message.author.id;

        new ApiRequestHandler(commandData.client)
          .requestAPIWithType<CommissionForm>(
            "POST",
            commissionForm,
            "CommissionForm/Add"
          )
          .then(commission => {
            var embed = new Discord.RichEmbed()
              .setTitle("Your commission has been created!")
              .addField(
                "Here you will find the information about your commission",
                "https://student.dapperdino.co.uk/commission/" + commission.id
              )
              .addField("Description:", commission.description)
              .addField("Status", commission.status)
              .setFooter("With ❤ by the DapperCoding team")
              .setColor("FF0000");

            commandData.message.author.send(embed);
            commandData.message.channel.send(
              "We've sent you a dm with more information about your request!"
            );
            // TODO: Send dm to user & let know in channel
          })
          .catch(console.error);
      });

    commandData.message.delete(0);
  }
}
