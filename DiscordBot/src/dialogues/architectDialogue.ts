import * as Discord from "discord.js";
import { ValidationError } from "../error";
import { FormBaseDialogue, FormBaseDialogueData } from "./FormBaseDialogue";

export class ArchitectDialogue extends FormBaseDialogue<ArchitectDialogueData> {
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
