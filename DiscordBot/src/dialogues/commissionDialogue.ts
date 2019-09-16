import { ValidationError } from "../error";
import { Message, TextChannel, RichEmbed, Client } from "discord.js";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";
import {
  CommissionFormModel,
  CommissionForm
} from "../models/forms/commissionForm";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";

export class CommissionDialogue {
  public nameStep(response: Message, data: CommissionDialogueData) {
    return new Promise<CommissionDialogueData>((resolve, reject) => {
      try {
        if (!response.content || response.content.length > 16) {
          reject(new ValidationError("Please provide a name (max 16 chars)"));
          return;
        }

        data.name = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public descriptionStep(response: Message, data: CommissionDialogueData) {
    return new Promise<CommissionDialogueData>((resolve, reject) => {
      try {
        if (!response.content || response.content.length > 200) {
          reject(new ValidationError("Please provide a name (max 200 chars)"));
          return;
        }

        data.description = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public functionalitiesStep(response: Message, data: CommissionDialogueData) {
    return new Promise<CommissionDialogueData>((resolve, reject) => {
      try {
        if (
          !response.content ||
          response.content.length < 60 ||
          response.content.length > 600
        ) {
          reject(
            new ValidationError("Please provide a name (min 60, max 600 chars)")
          );
          return;
        }

        data.functionalitites = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public budgetStep(response: Message, data: CommissionDialogueData) {
    return new Promise<CommissionDialogueData>((resolve, reject) => {
      try {
        if (!response.content || response.content.length > 200) {
          reject(new ValidationError("Please provide a name (max 200 chars)"));
          return;
        }

        data.budget = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public async CreateDialogue(
    client: Client,
    channel: TextChannel,
    authorId: string
  ) {
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

    const member = channel.guild.members.get(authorId);

    if (!member) return;

    await handler.getInput(channel as TextChannel, member.user).then(output => {
      let commissionForm = new CommissionFormModel();

      commissionForm.name = output.name;
      commissionForm.description = output.description;
      commissionForm.functionalitites = output.functionalitites;
      commissionForm.budget = output.budget;

      commissionForm.discordDiscordId = authorId;

      new ApiRequestHandler(client)
        .requestAPIWithType<CommissionForm>(
          "POST",
          commissionForm,
          "CommissionForm/Add"
        )
        .then(commission => {
          var embed = new RichEmbed()
            .setTitle("Your commission has been created!")
            .addField(
              "Here you will find the information about your commission",
              "https://student.dapperdino.co.uk/commission/" + commission.id
            )
            .addField("Description:", commission.description)
            .addField("Status", commission.status)
            .setFooter("With ❤ by the DapperCoding team")
            .setColor("FF0000");

          member.send(embed);
          channel.send(
            "We've sent you a dm with more information about your request!"
          );
          // TODO: Send dm to member & let know in channel
        })
        .catch(console.error);
    });
  }
}

export interface CommissionDialogueData {
  name: string;
  description: string;
  functionalitites: string;
  budget: string;
}

export class CommissionDialogueData implements CommissionDialogueData {}
