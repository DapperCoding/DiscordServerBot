import { GuildHelper } from "../../helpers/guildHelper";
import { TextChannel, RichEmbed, GuildMember } from "discord.js";
import { Constants } from "../../constants";

export class ApplicationEvent {
  public static handle(server, application) {
    const channel = server.channels.find(
      channel => channel.name.toLowerCase() === "dapper-coding"
    ) as TextChannel;
    const dapperCodingTeam = GuildHelper.GetAllWithRole(
      "dapper coding"
    ) as GuildMember[];
    const discordUser = server.members.get(application.discordId);
    const applicationEmbed = new RichEmbed()
      .setTitle(`A user has applied for the teacher role`)
      .addField("First name", application.firstName)
      .addField("Last name", application.lastName)
      .addField("Explanation", application.explanation)
      .addField("Links", application.links)
      .setColor(Constants.EmbedColors.GREEN)
      .setFooter("Please dm this user asap - or dm Mick");
    if (discordUser) {
      applicationEmbed.addField("The user", discordUser.user.username);
    } else {
      applicationEmbed.addField("The user", application.discordId);
    }

    if (channel) {
      channel.send(applicationEmbed);
    }

    try {
      dapperCodingTeam.forEach(member => {
        member.send(applicationEmbed);
      });
    } catch (e) {
      console.error(e);
    }

    if (discordUser) {
      try {
        let appliedEmbed = new RichEmbed()
          .setTitle("Thanks for your application!")
          .setColor(Constants.EmbedColors.GREEN)
          .addField(
            "Information",
            `You'll receive more information about the application soon.`
          )
          .setFooter("With ❤ the DapperCoding team");
        discordUser.send(appliedEmbed).catch(console.error);
      } catch (e) {}
    }
    return true;
  }
}
