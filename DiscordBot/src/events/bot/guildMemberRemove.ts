import { GuildMember } from "discord.js";
import { ChannelHelper } from "../../helpers/channelHelper";
import MissingChannelIdError from "../../error";

export class GuildMemberRemoveEvent {
  public static handle(member: GuildMember) {
    const welcomeChannel = ChannelHelper.getWelcomeChannel();
    // Check if welcome channel is found
    if (welcomeChannel != null)
      // Send discordMessage to welcome channel
      welcomeChannel.send(
        `${
          member.displayName
        }, it's a shame you had to leave us. We'll miss you :(`
      );
    else {
      // Send missing channel id error for welcome channel
      let err = new MissingChannelIdError("welcome");
      err.log();
    }
  }
}
