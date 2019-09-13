import * as Discord from "discord.js";
import { ValidationError } from "../error";

export class FaqIdentifierDialogue {
  /**
   * descriptionStep
   */
  public identifyStep(response: Discord.Message, data: any) {
    return new Promise<any>((resolve, reject) => {
      try {
        if (
          !response.content.toLowerCase().startsWith("ques") &&
          !response.content.toLowerCase().startsWith("answ")
        ) {
          reject(
            new ValidationError(
              `You can only choose from these values: Question, Answer.`
            )
          );
          return;
        }

        data.identifier = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }
}
