import * as Discord from "discord.js";
import { ValidationError } from "../error";

export class ApplicationDialogue<T extends ApplicationDialogueData> {
  /**
   * ageStep
   */
  public reasonStep(response: Discord.Message, data: T) {
    return new Promise<T>((resolve, reject) => {
      try {
        if (response.content.length <= 0) {
          reject(new ValidationError(`You must enter a reason.`));
        }

        data.reason = response.content;

        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export interface ApplicationDialogueData {
  reason: string;
}

export class ApplicationDialogueData implements ApplicationDialogueData {}
