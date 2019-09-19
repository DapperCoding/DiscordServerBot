import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { ChannelHandler } from "../handlers/channelHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { DiscordUser } from "../models/discordUser";
import { TeacherForm } from "../models/forms/forms";
import { FormBase } from "../models/forms/formBase";
import {
  ApplicationDialogue,
  ApplicationDialogueData
} from "../dialogues/applicationDialogue";
import { DialogueHandler, DialogueStep } from "../handlers/dialogueHandler";
import { Constants } from "../constants";
import { ErrorEmbed } from "../embeds/errorEmbed";

export default class DenyApplicatioNCommand extends BaseCommand {
  readonly commandWords = [
    "denyapplication",
    "deny",
    "reject",
    "rejectapplication"
  ];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?denyApplications",
      description: "For recruiters to deny applications.",
      roles: ["recruiter"]
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return channel.parent.name.toLowerCase() === "interviews";
  }

  public async process(commandData: CommandData): Promise<void> {
    // Get member from guild
    let member = commandData.client.guilds
      .first()
      .members.find(member => member.id === commandData.message.author.id);

    // Check if member exists in guild
    if (member == null) return;

    let sent = 0;

    let channelName = (commandData.message
      .channel as Discord.TextChannel).name.toString();
    let channelNameParts = channelName.split("-");
    if (channelNameParts.length < 2) {
      // TOOD: shouldn't ever happen
      return;
    }

    let steps = new ApplicationDialogue();

    let data = new ApplicationDialogueData();
    let reason: DialogueStep<ApplicationDialogueData> = new DialogueStep<
      ApplicationDialogueData
    >(data, steps.reasonStep, "Enter the reason for denying the application:");

    let reasonHandler = new DialogueHandler([reason], data);

    await reasonHandler
      .getInput(
        commandData.message.channel as Discord.TextChannel,
        commandData.message.author
      )
      .then(info => {
        new ApiRequestHandler(commandData.client)
          .requestAPIWithType<FormBase>(
            "POST",
            { reason: info.reason },
            `forms/${channelNameParts[0]}/${channelNameParts[1]}/reject/${member.id}`
          )

          // When everything went right, we receive a ticket back, so we add the h2h-er to the ticket channel
          .then(data => {
            // Get applicant
            let applicant = commandData.client.users.get(
              data.discordUser.discordId
            );
            // Should never happen
            if (!applicant) {
              return;
            }

            let deniedApplication = new Discord.RichEmbed()
              .setTitle("You've been denied.")
              .setThumbnail(commandData.message.author.avatarURL)
              .setColor(Constants.EmbedColors.RED)
              .setDescription(
                `Your ${channelNameParts[0]} application has been denied by ${commandData.message.author.tag}.
                Reason: ${info.reason}`
              );

            applicant.send(deniedApplication);

            commandData.message.channel.delete();
          })
          .catch(err => {
            sent++;
            if (sent == 1)
              // Something went wrong, log error
              commandData.message.channel.send(ErrorEmbed.Build(err));
          });
      });

    // Post request to /api/Ticket/{ticketId}/AddAssignee to add current user to db as Assignee
  }
}
