import { GuildHelper } from "../../helpers/guildHelper";
import { Guild, Client, RichEmbed, GuildMember } from "discord.js";
import { Constants } from "../../constants";

export class ProductEnquiryEvent {
  public static handle(server: Guild, serverBot: Client, productEnquiry: any) {
    let dapperCodingTeam = GuildHelper.GetAllWithRole(
      "dapper coding"
    ) as GuildMember[];
    let enquiryEmbed = new RichEmbed()
      .setTitle(
        `A user has requested contact regarding the ${productEnquiry.product}`
      )
      .setColor(Constants.EmbedColors.GREEN)
      .addField("The user", productEnquiry.discordId)
      .setFooter("Please DM this user asap - or DM Mick");

    try {
      dapperCodingTeam.forEach(member => {
        member.send(enquiryEmbed);
      });
    } catch (e) {
      console.error(e);
    }

    let testUser = serverBot.users.find(
      user => user.tag == productEnquiry.discordId
    );
    if (testUser) {
      try {
        let productEnquiryEmbed = new RichEmbed()
          .setTitle("Thanks for your requesting contact!")
          .setColor(Constants.EmbedColors.GREEN)
          .addField(
            "Information",
            `You'll receive more information about ${productEnquiry.product}`
          )
          .setFooter("With ❤ the DapperCoding team");
        testUser.send(productEnquiryEmbed).catch(console.error);
      } catch (e) {}
    }
    return true;
  }
}
