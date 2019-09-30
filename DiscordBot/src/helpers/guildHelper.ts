import { Guild, GuildMember } from "discord.js";

export class GuildHelper {
  private static guild: Guild | null = null;

  public static getGuild() {
    return this.guild;
  }

  public static setGuild(guild: Guild) {
    this.guild = guild;
  }

  public static GetAllWithRole(requestedRole: string) {
    if (!this.guild) {
      return null;
    }
    //Get all members in the server
    let allUsers = this.guild.members.array();

    //Create an array to story all the members with the requested role
    let usersWithRole = new Array<GuildMember>();

    //Loop through all the members in the server
    for (let i = 0; i < allUsers.length; i++) {
      //Check if any of their roles has the same name as the requested role
      if (allUsers[i].roles.find(role => role.name.toLowerCase() === requestedRole.toLowerCase())) {
        //Add that member to the list
        usersWithRole.push(allUsers[i]);
      }
    }

    //Return all the members that have the role
    return usersWithRole;
  }

  public static getChannelByName(name: string) {
    if (!this.guild) {
      return null;
    }
    return this.guild.channels.find(x => x.name == name);
  }
}
