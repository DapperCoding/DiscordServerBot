import { GuildMember } from "discord.js";
import { ChannelHelper } from "../../helpers/channelHelper";
import MissingChannelIdError from "../../error";

export class GuildMemberRemoveEvent {
  public static handle(member: GuildMember) {}
}
