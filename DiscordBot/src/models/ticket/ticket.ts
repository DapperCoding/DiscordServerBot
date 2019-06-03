import { applicant } from "./applicant";
import { proficiency } from "../proficiency/proficiency";

export interface ticket {
  id: number;
  description: string;
  subject: string;
  applicant: applicant;
  language: proficiency;
  languageId: number;
  frameworkId:number;
  framework: proficiency;
}

export class ticket implements ticket {}
