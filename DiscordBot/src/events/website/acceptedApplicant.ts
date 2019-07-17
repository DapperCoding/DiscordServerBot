import { Guild, TextChannel } from "discord.js";

export class AcceptedApplicantEvent {
  public static handle(server: Guild, accepted: any) {
    let member = server.members.find(
      member => member.user.id == accepted.discordId
    );
    if (member == null) return true;

    let role = server.roles.find(
      role => role.name.toLowerCase() == "happy to help"
    );
    if (role == null) return true;

    member.addRole(role).catch(console.error);
    member.send(
      "Please use the `?commands` command in the #h2h-admin-commands"
    );

    let channel = server.channels.find(
      channel => channel.name.toLowerCase() == "dapper-team"
    ) as TextChannel;
    if (channel == null) return false;

    channel
      .send(`Please welcome ${member.user.username} to the team!`)
      .catch(console.error);

    return true;
  }
}
