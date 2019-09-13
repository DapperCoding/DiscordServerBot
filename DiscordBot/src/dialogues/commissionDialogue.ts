import { ValidationError } from "../error";
import { Message } from "discord.js";

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
}

export interface CommissionDialogueData {
  name: string;
  description: string;
  functionalitites: string;
  budget: string;
}

export class CommissionDialogueData implements CommissionDialogueData {}
