import * as Discord from "discord.js";
import { ValidationError } from "../error";
import { FormBaseDialogue, FormBaseDialogueData } from "./formBaseDialogue";
import { DialogueHandler, DialogueStep } from "../handlers/dialogueHandler";
import { BaseDialogue } from "./baseDialogue";

export class ArchitectDialogue extends FormBaseDialogue<ArchitectDialogueData> implements BaseDialogue<ArchitectDialogueData> {

  public async createHandler(data:ArchitectDialogueData, channel:Discord.TextChannel|Discord.DMChannel, user:Discord.User, callback:(data:ArchitectDialogueData)=> void) {
    
    // Create description step
    let motivationStep: DialogueStep<ArchitectDialogueData> = new DialogueStep(
      data,
      this.motivationStep,
      "Why do you want to become an Architect? (80 - 400 characters)"
    );

    let developmentExperience: DialogueStep<
      ArchitectDialogueData
    > = new DialogueStep(
      data,
      this.developmentExperience,
      "What is your previous experience in software development? (80 - 400 characters)"
    );

    let previousIdeas: DialogueStep<ArchitectDialogueData> = new DialogueStep(
      data,
      this.previousIdeas,
      "What are some links to interesting software you have designed in the past? (max 400 characters)"
    );
    // Create category step
    let ageStep: DialogueStep<ArchitectDialogueData> = new DialogueStep(
      data,
      this.ageStep,
      "How old are you?"
    );

    // Create new dialogueHandler with a titleStep and descriptionStep
    let handler = new DialogueHandler(
      [motivationStep, developmentExperience, previousIdeas, ageStep],
      data
    );

    // Collect info from steps
    await handler
      .getInput(
        channel,
        user,
        false
      )
      .then(callback);
  }

  /**
   * ageStep
   */

  public previousIdeas(response: Discord.Message, data: ArchitectDialogueData) {
    return new Promise<ArchitectDialogueData>((resolve, reject) => {
      try {
        if (response.content.length <= 60) {
          reject(
            new ValidationError(
              "You must provide a 60-200 character message on what previous ideas you've had."
            )
          );
        }

        data.previousIdeas = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export interface ArchitectDialogueData extends FormBaseDialogueData {
  previousIdeas: string;
}

export class ArchitectDialogueData implements ArchitectDialogueData {}
