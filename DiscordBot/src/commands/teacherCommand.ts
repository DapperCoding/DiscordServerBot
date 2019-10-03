import * as discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import {
  TeacherDialogue, TeacherDialogueData
} from "../dialogues/teacherDialogue";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { Constants, ChannelNames } from "../constants";
import { TeacherForm } from "../models/forms/forms";

export default class TicketCommand extends BaseCommand {
  readonly commandWords = ["teacher", "teacherapplication"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?teacher",
      description: "Creates an application for the teacher role."
    };
  }

  public canUseInChannel(channel: discord.TextChannel): boolean {
    if (channel.parent.name.toLowerCase() !== "bot commands") return false;
    return channel.name.toLowerCase() === "applications";
  }

  public canUseCommand(roles: discord.Role[]) {
    let helpObj: IBotCommandHelp = this.getHelp();
    let canUseCommand = true;

    if (helpObj.roles != null && helpObj.roles.length > 0) {
      canUseCommand = false;

      for (var cmdRole in helpObj.roles) {
        if (
          roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase())
        )
          canUseCommand = true;
      }
    }

    return canUseCommand;
  }

  public async process(commandData: CommandData): Promise<void> {
    let dm = {} as discord.Message;
    
    try {
      dm = (await commandData.message.author.send(
        "Create your application"
      )) as discord.Message;
      commandData.message.channel.send(
        "Check your dms! You can continue creating your application there."
      );
    } catch (e) {
      commandData.message.channel.send(
        "Please use the web panel or enable DMs to use this feature."
      );
      return;
    }
    const dialogue = new TeacherDialogue();
    const collectedInfo = new TeacherDialogueData();
    dialogue.createHandler(collectedInfo,
      dm.channel as discord.TextChannel | discord.DMChannel,
      commandData.message.author,
      (data) => {
        data.discordDiscordId = commandData.message.author.id;

        new ApiRequestHandler(commandData.client)
          .requestAPIWithType<TeacherForm>("POST", data, "forms/teacher/add")
          .then((form) => {
            let applicationEmbed = new discord.RichEmbed()
              .setTitle("Application Created Successfully!")
              .setColor(Constants.EmbedColors.GREEN)
              .addField("Age:", data.age, false)
              .addField("Your Motivation:", data.motivation, false)
              .addField("Your Project Link(s):", data.projectLinks, false)
              .addField("Your GitHub Link(s):", data.githubLink, false)
              .addField(
                "Your Previous Teaching Experience:",
                data.teachingExperience,
                false
              )
              .addField(
                "Your Development Experience:",
                data.developmentExperience,
                false
              )
              .setFooter(
                "Thanks for being patient while we revamp our systems."
              );

            // Send ticketEmbed
            commandData.message.author.send(applicationEmbed);
            const recruiterChannel = commandData.guild.channels.find(x=>x.name.toLowerCase()==ChannelNames.Dapper.RECRUITER) as discord.TextChannel;

            const recruiterEmbed = new discord.RichEmbed()
            .setTitle("Someone just applied for the teacher role")
            .setDescription(`Go to https://apply.dapperdino.co.uk/recruiter/teacher/${form.id} to interact with the applicant`);

            if (recruiterChannel) {
              recruiterChannel.send(recruiterEmbed);
            }
            
          });
      });
  }
}
