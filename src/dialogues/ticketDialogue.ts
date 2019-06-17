import * as discord from "discord.js";
import { validationError } from "../errors";

export class ticketDialogue {
  /**
   * titleStep
   */
  public titleStep(response: discord.Message, data: ticketDialogueData) {
    return new Promise<ticketDialogueData>((resolve, reject) => {
      try {
        if (response.content.length < 20) {
          reject(
            new validationError(
              `Minimum length for title is 20 characters, current length: ${
                response.content.length
              }.`
            )
          );
        }

        if (response.content.length > 100) {
          return reject(
            new validationError(
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
  public descriptionStep(response: discord.Message, data: ticketDialogueData) {
    return new Promise<ticketDialogueData>((resolve, reject) => {
      try {
        if (response.content.length < 60) {
          reject(
            new validationError(
              `Minimum length for description is 60 characters, current length: ${
                response.content.length
              }.`
            )
          );
          return;
        }

        if (response.content.length > 700) {
          reject(
            new validationError(
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
  public categoryStep(response: string, data: ticketDialogueData) {
    return new Promise<ticketDialogueData>((resolve, reject) => {
      try {
        data.category = response;
        return resolve(data);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export interface ticketDialogueData {
  title: string;
  description: string;
  category: string;
}

export class ticketDialogueData implements ticketDialogueData {}
