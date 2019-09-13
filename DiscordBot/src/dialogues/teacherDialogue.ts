import * as Discord from "discord.js";
import { ValidationError } from "../error";
import { FormBaseDialogue, FormBaseDialogueData } from "./FormBaseDialogue";

export class TeacherDialogue extends FormBaseDialogue<TeacherDialogueData> {
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
