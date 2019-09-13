import { FormBase, FormReply } from "./formBase";

export interface ArchitectForm extends FormBase {
  replies: Array<FormReply<ArchitectForm>>;
  developmentExperience: string;
  previousIdeas: string;
  age: number;
}

export interface TeacherForm extends FormBase {
  developmentExperience: string;
  teachingExperience: string;
  githubLink: string;
  projectLinks: string;
  age: number;
  replies: Array<FormReply<TeacherForm>>;
}

export interface RecruiterForm extends FormBase {
  developmentExperience: string;
  age: number;
  githubLink: string;
  projectLinks: string;
  recruitingExperience: string;
  developmentReviewingExperience: string;
}

export interface ArchitectFormModel extends ArchitectForm {
  discordDiscordId: string;
}

export interface TeacherFormModel extends TeacherForm {
  discordDiscordId: string;
}

export interface RecruiterFormModel extends RecruiterForm {
  discordDiscordId: string;
}
