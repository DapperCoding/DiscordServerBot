import { FormReply } from "./formBase";

import { TeacherForm } from "./forms";

export interface TeacherFormReply extends FormReply<TeacherForm> {}
export interface ArchitectFormReply extends FormReply<TeacherForm> {}
export interface RecruiterFormReply extends FormReply<TeacherForm> {}

export interface TeacherFormReplyModel extends TeacherFormReply {
  discordId: string;
}

export interface RecruiterFormReplyModel extends RecruiterFormReply {
  discordId: string;
}

export interface ArchitectFormReplyModel extends ArchitectFormReply {
  discordId: string;
}
