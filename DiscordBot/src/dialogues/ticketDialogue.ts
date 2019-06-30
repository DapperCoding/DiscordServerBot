import * as Discord from "discord.js";
import { ValidationError } from "../error";

export class TicketDialogue {
  /**
   * titleStep
   */
  public titleStep(response: Discord.Message, data: TicketDialogueData) {
    return new Promise<TicketDialogueData>((resolve, reject) => {
      try {
        if (response.content.length < 20) {
          reject(
            new ValidationError(
              `Minimum length for title is 20 characters, current length: ${
                response.content.length
              }.`
            )
          );
        }

        if (response.content.length > 100) {
          return reject(
            new ValidationError(
              `Title may not exceed 100 characters, current length: ${
                response.content.length
              }.`
            )
          );
        }

        data.title = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * descriptionStep
   */
  public descriptionStep(response: Discord.Message, data: TicketDialogueData) {
    return new Promise<TicketDialogueData>((resolve, reject) => {
      try {
        if (response.content.length < 60) {
          reject(
            new ValidationError(
              `Minimum length for description is 60 characters, current length: ${
                response.content.length
              }.`
            )
          );
          return;
        }

        if (response.content.length > 700) {
          reject(
            new ValidationError(
              `Description may not exceed 700 characters, current length: ${
                response.content.length
              }.`
            )
          );
          return;
        }

        data.description = response.content;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * categoryStep
   */
  public categoryStep(response: string, data: TicketDialogueData) {
    return new Promise<TicketDialogueData>((resolve, reject) => {
      try {
        data.category = response;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export interface TicketDialogueData {
  title: string;
  description: string;
  category: string;
}

export class TicketDialogueData implements TicketDialogueData {}
