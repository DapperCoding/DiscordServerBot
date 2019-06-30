import { Applicant } from "./applicant";
import { Proficiency } from "../proficiency/proficiency";

export interface Ticket {
  id: number;
  description: string;
  subject: string;
  applicant: Applicant;
  language: Proficiency;
  languageId: number;
  frameworkId: number;
  framework: Proficiency;
}

export class Ticket implements Ticket { }
