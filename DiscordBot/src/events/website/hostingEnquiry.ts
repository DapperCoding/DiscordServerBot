import { RichEmbed, TextChannel, Guild, GuildMember } from "discord.js";
import { GuildHelper } from "../../helpers/guildHelper";
import { HostingEnquiry } from "../../models/signalr/hostingEnquiry";

export class HostingEnquiryEvent {
  public static handle(server: Guild, enquiry: HostingEnquiry) {
    const channel = server.channels.find(
      channel => channel.name.toLowerCase() === "dapper-coding"
    ) as TextChannel;
    const discordUser = server.members.get(enquiry.discordId);

    if (channel == null) return true;

    let dapperCodingTeam = GuildHelper.GetAllWithRole(
      "dappercoding"
    ) as GuildMember[];
    let hostingEmbed = new RichEmbed()
      .setTitle(
        `A user has requested contact regarding the hosting ${
          enquiry.packageType
        }`
      )
      .setColor("0x00ff00")
      .setFooter("Please dm this user asap - or dm Mick");

    if (discordUser) {
      hostingEmbed.addField("The user", discordUser.user.username);
    } else {
      hostingEmbed.addField("The user", enquiry.discordId);
    }

    channel.send(hostingEmbed);

    try {
      dapperCodingTeam.forEach(member => {
        member.send(hostingEmbed);
      });
    } catch (e) {
      console.error(e);
    }

    if (discordUser) {
      try {
        let hostingEnquiryEmbed = new RichEmbed()
          .setTitle(
            "Thanks for taking interest in one of our hosting packages!"
          )
          .setDescription("We usually contact you within 24 hours!")
          .setColor("0xff0000")
          .addField(
            "Information",
            `You'll receive more information about hosting package: ${
              enquiry.package
            }, soon.`
          )
          .setFooter("With ❤ by the DapperCoding team");
        discordUser.send(hostingEnquiryEmbed).catch(console.error);
      } catch (e) {}
    }
    return true;
  }
}
