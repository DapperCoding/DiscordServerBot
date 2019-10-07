import * as Discord from "discord.js";
import { ValidationError } from "../error";
import { FormBaseDialogue, FormBaseDialogueData } from "./formBaseDialogue";

export class RecruiterDialogue extends FormBaseDialogue<RecruiterDialogueData> {
  /**
   * ageStep
   */

  public recruitingExperience(
    response: Discord.Message,
    data: RecruiterDialogueData
  ) {
    return new Promise<RecruiterDialogueData>((resolve, reject) => {
      try {
        if (response.content.length <= 80 || response.content.length > 400) {
          reject(
            new ValidationError(
              "You must provide a 80-400 character message on what previous recruiting experience you have."
            )
          );
        }

        data.recruitingExperience = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public developmentReviewingExperience(
    response: Discord.Message,
    data: RecruiterDialogueData
  ) {
    return new Promise<RecruiterDialogueData>((resolve, reject) => {
      try {
        if (response.content.length <= 80 || response.content.length > 400) {
          reject(
            new ValidationError(
              "You must provide a 80-400 character message on what previous development reviewing experience you have."
            )
          );
        }

        data.developmentReviewingExperience = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public githubLinks(response: Discord.Message, data: RecruiterDialogueData) {
    return new Promise<RecruiterDialogueData>((resolve, reject) => {0
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

  public projectLinks(response: Discord.Message, data: RecruiterDialogueData) {
    return new Promise<RecruiterDialogueData>((resolve, reject) => {
      try {
        if (response.content.length <= 0) {
          reject(
            new ValidationError(
              "You must provide 1 or more links to a previous projects."
            )
          );
        } else if (response.content.length > 400) {
          reject(
            new ValidationError(
              "There is a maximum of 400 characters for this field."
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

export interface RecruiterDialogueData extends FormBaseDialogueData {
  recruitingExperience: string;
  developmentReviewingExperience: string;
  projectLinks: string;
  githubLink: string;
}

export class RecruiterDialogueData implements RecruiterDialogueData {}
