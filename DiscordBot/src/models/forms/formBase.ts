import { DiscordUser } from "../discordUser";
import { Message } from "../message";

export interface FormBase {
  id: number;
  discordId: number;
  discordUser: DiscordUser;
  motivation: string;
  status: ApplicationFormStatus;
}

export enum ApplicationFormStatus {
  open = 0,
  denied = 1,
  accepted = 2,
  interviewing = 3
}

export interface FormReply<T = FormBase> {
  id: number;
  formId: number;
  discordMessageId: number;
  discordMessage: Message;
  form: T;
}
