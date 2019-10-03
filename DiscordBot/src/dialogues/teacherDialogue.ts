import * as Discord from "discord.js";
import { ValidationError } from "../error";
import { FormBaseDialogue, FormBaseDialogueData } from "./formBaseDialogue";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";
import { BaseDialogue } from "./baseDialogue";

export class TeacherDialogue extends FormBaseDialogue<TeacherDialogueData>  implements BaseDialogue<TeacherDialogueData> {

  public async createHandler(data: TeacherDialogueData, channel:Discord.TextChannel|Discord.DMChannel, user:Discord.User, callback:(data:TeacherDialogueData)=> void){
    // Create description step
    let motivationStep: DialogueStep<TeacherDialogueData> = new DialogueStep(
      data,
      this.motivationStep,
      "Why do you want to become a Teacher? (80 - 400 characters)"
    );

    let developmentExperienceStep: DialogueStep<
      TeacherDialogueData
    > = new DialogueStep(
      data,
      this.developmentExperience,
      "What is your previous experience in software development (80 - 400 characters)"
    );

    let teachingExperienceStep: DialogueStep<
      TeacherDialogueData
    > = new DialogueStep(
      data,
      this.teachingExperience,
      "What is your teaching experience? (60 - 200 characters)"
    );

    let githubLinksStep: DialogueStep<TeacherDialogueData> = new DialogueStep(
      data,
      this.githubLinks,
      "What is the link to your github profile?"
    );

    let projectLinksStep: DialogueStep<TeacherDialogueData> = new DialogueStep(
      data,
      this.projectLinks,
      "What are some links to interesting projects you worked on (you can also tell us a bit about them in here)?"
    );

    // Create category step
    let ageStep: DialogueStep<TeacherDialogueData> = new DialogueStep(
      data,
      this.ageStep,
      "How old are you?"
    );

    
    // Create new dialogueHandler with a titleStep and descriptionStep
    let handler = new DialogueHandler(
      [
        motivationStep,
        developmentExperienceStep,
        teachingExperienceStep,
        githubLinksStep,
        projectLinksStep,
        ageStep
      ],
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

  public teachingExperience(
    response: Discord.Message,
    data: TeacherDialogueData
  ) {
    return new Promise<TeacherDialogueData>((resolve, reject) => {
      try {
        if (response.content.length < 60) {
          reject(
            new ValidationError(
              "You must provide a 60-200 character message on what previous teaching experience you have."
            )
          );
        }

        if (response.content.length > 200) {
          reject(
            new ValidationError(
              "You must provide a 60-200 character message on what previous teaching experience you have."
            )
          );
        }

        data.teachingExperience = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public githubLinks(response: Discord.Message, data: TeacherDialogueData) {
    return new Promise<TeacherDialogueData>((resolve, reject) => {
      try {
        if (
          response.content.length <= 0 &&
          !response.content.toLowerCase().includes("github")
        ) {
          reject(
            new ValidationError(
              "You must provide 1 or more links to a GitHub profile."
            )
          );
        }

        data.githubLink = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public projectLinks(response: Discord.Message, data: TeacherDialogueData) {
    return new Promise<TeacherDialogueData>((resolve, reject) => {
      try {
        if (response.content.length <= 0) {
          reject(
            new ValidationError(
              "You must provide 1 or more links to a previous projects."
            )
          );
        }

        data.projectLinks = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export interface TeacherDialogueData extends FormBaseDialogueData {
  teachingExperience: string;
  githubLink: string;
  projectLinks: string;
}

export class TeacherDialogueData implements TeacherDialogueData {}
