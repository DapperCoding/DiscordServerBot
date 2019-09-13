import * as Discord from "discord.js";
import { ValidationError } from "../error";

export class FormBaseDialogue<T extends FormBaseDialogueData> {
  /**
   * ageStep
   */
  public ageStep(response: Discord.Message, data: T) {
    return new Promise<T>((resolve, reject) => {
      try {
        if (response.content.length <= 0) {
          reject(new ValidationError(`You must enter an age.`));
        }

        data.age = parseInt(response.content);

        if (isNaN(data.age)) {
          reject(new ValidationError("You must enter a number."));
        }

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public motivationStep(response: Discord.Message, data: T) {
    return new Promise<T>((resolve, reject) => {
      try {
        if (response.content.length <= 60) {
          reject(
            new ValidationError(
              "You must provide a 60-200 character message on what motivates you."
            )
          );
        }

        data.motivation = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  public developmentExperience(response: Discord.Message, data: T) {
    return new Promise<T>((resolve, reject) => {
      try {
        if (response.content.length <= 60) {
          reject(
            new ValidationError(
              "You must provide a 60-200 character message on what development experience you have."
            )
          );
        }

        data.developmentExperience = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export interface FormBaseDialogueData {
  age: number;
  discordDiscordId: string;
  motivation: string;
  developmentExperience: string;
}

export class FormBaseDialogueData implements FormBaseDialogueData {}
