import * as Discord from "discord.js";
import { ValidationError } from "../error";
import { BaseDialogueData, BaseDialogue } from "./baseDialogue";


export class FormBaseDialogue<T extends FormBaseDialogueData> implements BaseDialogue<T> {
  
  createHandler(data: T, channel: Discord.TextChannel | Discord.DMChannel, user: Discord.User, callback: (data: T) => void): void {
    throw new Error("Method not implemented.");
  }

  
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

        if (data.age < 13) {
          reject(new ValidationError("You must be at least 13 years old."));
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
        if (response.content.length < 80 || response.content.length > 400) {
          reject(
            new ValidationError(
              "You must provide a 80-400 character message on what motivates you."
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
        if (response.content.length < 80 || response.content.length > 400) {
          reject(
            new ValidationError(
              "You must provide a 80-400 character message on what development experience you have."
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

export interface FormBaseDialogueData extends BaseDialogueData {
  age: number;
  discordDiscordId: string;
  motivation: string;
  developmentExperience: string;
}

export class FormBaseDialogueData implements FormBaseDialogueData {}
