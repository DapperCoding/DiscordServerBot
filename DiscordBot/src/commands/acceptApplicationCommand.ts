import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { FormBase } from "../models/forms/formBase";
import {
  ApplicationDialogueData,
  ApplicationDialogue
} from "../dialogues/applicationDialogue";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";

export default class AcceptApplicationCommand extends BaseCommand {
  readonly commandWords = ["acceptapplication"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?acceptApplication",
      description: "For recruiters to accept applications.",
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
    >(
      data,
      steps.reasonStep,
      "Enter the reason for accepting the application:"
    );

    let reasonHandler = new DialogueHandler([reason], data);

    await reasonHandler
      .getInput(
        commandData.message.channel as Discord.TextChannel,
        commandData.message.author
      )
      .then(info => {
        new ApiRequestHandler(commandData.client)

          // Set params for requestAPI
          .requestAPIWithType<FormBase>(
            "POST",
            { reason: info.reason },
            `forms/${channelNameParts[0]}/${channelNameParts[1]}/accept/${member.id}`
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

            let acceptedApplication = new Discord.RichEmbed()
              .setTitle("You've been accepted.")
              .setThumbnail(commandData.message.author.avatarURL)
              .setColor("#2dff2d")
              .setDescription(
                `Your ${channelNameParts[0]} application has been accepted by ${commandData.message.author.tag}.
                Reason: ${info.reason}`
              );

            applicant.send(acceptedApplication);

            let dapperTeam = commandData.guild.channels.find(
              c => c.name.toLowerCase() === "dapper-team"
            ) as Discord.TextChannel;

            let dapperTeamEmbed = new Discord.RichEmbed()
              .setTitle("New Team Member.")
              .setThumbnail(applicant.displayAvatarURL)
              .setColor("#2dff2d")
              .setDescription(
                `Please welcome our new ${channelNameParts[0]}, ${data.discordUser.username}.`
              );

            dapperTeam.send(dapperTeamEmbed);

            commandData.message.channel.delete();

            commandData.guild
              .member(applicant)
              .addRole(
                commandData.guild.roles.find(
                  r => r.name.toLowerCase() === channelNameParts[0]
                )
              );
          })
          .catch(err => {
            sent++;
            if (sent == 1)
              // Something went wrong, log error
              commandData.message.reply(
                `Whoops, something went wrong. \n ${err}`
              );
          });
      });

    // Post request to /api/Ticket/{ticketId}/AddAssignee to add current user to db as Assignee
  }
}
