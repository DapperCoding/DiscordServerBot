import { ChannelHelper } from "../../helpers/channelHelper";
import { RichEmbed, GuildMember } from "discord.js";
import { ClientHelper } from "../../helpers/clientHelper";
import MissingChannelIdError from "../../error";
import { Constants } from "../../constants";

export class GuildMemberAddEvent {
  public static handle(member: GuildMember) {
    const welcomeChannel = ChannelHelper.getWelcomeChannel();
    const client = ClientHelper.getClient();

    if (client == null) return;
    // Check if we found the welcome channel
    if (welcomeChannel != null) {
      // Create welcome rules
      let welcomeEmbed = new RichEmbed()
        .setTitle("Welcome " + member.user.username + "!")
        .setColor(Constants.EmbedColors.GREEN)
        .addField(
          "Information",
          "I've just sent you a PM with some details about the server, it would mean a lot if you were to give them a quick read."
        )
        .addField(
          "Thanks For Joining The Other " +
            member.guild.memberCount.toString() +
            " Of Us!",
          "Sincerely, your friend, DapperBot."
        );

      // Add image if user has avatar
      if (member.user.avatarURL != null) {
        welcomeEmbed.setImage(member.user.avatarURL);
      } else {
        welcomeEmbed.setImage(client.user.displayAvatarURL);
      }

      // Send welcome rules
      welcomeChannel.send(welcomeEmbed);
    } else {
      // Log new missing channel id error for the welcome channel
      let err = new MissingChannelIdError("welcome");
      err.log();
    }

    // Send rules intro text
    member.send(
      `Hello ${member.displayName}. Thanks for joining the server. If you wish to use our bot then simply use the command '?commands' in any channel and you'll recieve a pm with a list about all our commands. Anyway, here are the server rules:`
    );

    // Create & send rules embed
    let rules = new RichEmbed()
      .addField(
        "Rule 1",
        "Keep the chat topics relevant to the channel you're using"
      )
      .addField(
        "Rule 2",
        "No harassing others (we're all here to help and to learn)"
      )
      .addField(
        "Rule 3",
        "No spam advertising (if there's anything you're proud of and you want it to be seen then put it in the showcase channel, but only once)"
      )
      .addField(
        "Rule 4",
        "Don't go around sharing other people's work claiming it to be your own"
      )
      .addField(
        "Rule 5",
        "You must only use ?report command for rule breaking and negative behaviour. Abusing this command will result if you being the one who is banned"
      )
      .addField(
        "Rule 6",
        "Don't private message Dapper Dino for help, you're not more privileged than the other hundreds of people here. Simply ask once in the relevant help channel and wait patiently"
      )
      .addField(
        "Rule 7",
        "Read the documentation before asking something that it tells you right there in the documentation. That's why someone wrote it all!"
      )
      .addField(
        "Rule 8",
        "Understand that Dapper Dino and the other helping members still have lives of their own and aren't obliged to help you just because they are online"
      )
      .addField(
        "Rule 9",
        "Be polite, there's nothing ruder than people joining and demanding help"
      )
      .addField(
        "Rule 10",
        "Finally, we are here to teach, not to copy and paste code for you to use. If we see you have a problem that isn't too difficult to need help with then we will expect you to figure it out on your own so you actually learn whilst possibly giving you some hints if needed"
      )
      .setThumbnail(client.user.displayAvatarURL)
      .setColor(Constants.EmbedColors.YELLOW)
      .setFooter("If these rules are broken then don't be surprised by a ban");
    member.send(rules);

    // Send extra info
    member.send(
      "If you are happy with these rules then feel free to use the server as much as you like. The more members the merrier :D"
    );
    member.send(
      "Use the command '?commands' to recieve a PM with all my commands and how to use them"
    );
    member.send(
      "(I am currently being tested on by my creators so if something goes wrong with me, don't panic, i'll be fixed. That's it from me. I'll see you around :)"
    );

    // Add member to Member role
    member.addRole(member.guild.roles.find(role => role.name === "Student"));
  }
}
