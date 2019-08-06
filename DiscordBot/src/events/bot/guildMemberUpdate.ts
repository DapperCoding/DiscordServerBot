import { GuildMember } from "discord.js";
import { ApiRequestHandler } from "../../handlers/apiRequestHandler";

export class GuildMemberUpdateEvent {
  public static handle(oldMember: GuildMember, newMember: GuildMember) {
    this.SyncUser(oldMember, newMember);
  }

  private static SyncUser(oldMember: GuildMember, newMember: GuildMember) {

    let id: string = "";

    if (oldMember !== null) {
      id = oldMember.id;
    } else {
      id = newMember.id;
    }

    new ApiRequestHandler(newMember.client)
      .requestAPI(
        "GET",
        null,
        `discorduser/syncuser/${id}`);
  }
}
