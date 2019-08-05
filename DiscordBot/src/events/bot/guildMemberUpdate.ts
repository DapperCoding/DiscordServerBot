import { GuildMember } from "discord.js";
import { ApiRequestHandler } from "../../handlers/apiRequestHandler";

export class GuildMemberUpdateEvent {
  public static handle(oldMember: GuildMember, newMember: GuildMember) {
    this.SyncUser(oldMember, newMember);
  }

  private static SyncUser(oldMember: GuildMember, newMember: GuildMember) {
    if (oldMember === null || newMember === null) { return; }

    new ApiRequestHandler(newMember.client)
      .requestAPI(
        "GET",
        null,
        `discorduser/syncuser/${newMember.id}`);
  }
}
