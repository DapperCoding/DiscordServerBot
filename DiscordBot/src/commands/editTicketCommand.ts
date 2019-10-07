import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { ChannelHandler } from "../handlers/channelHandler";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { DiscordUser } from "../models/discordUser";
import { TextChannel } from "discord.js";
import { TicketProficiencyDialogue } from "../dialogues/TicketProficiencyDialogue";
import { Ticket } from "../models/ticket/ticket";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";
import {
  TicketDialogueData,
  TicketDialogue
} from "../dialogues/ticketDialogue";
import { TicketHelper } from "../helpers/ticketHelper";
import { ConfigManager } from "../configManager";

export default class EditTicketCommand extends BaseCommand {
  readonly commandWords = [
    "title",
    "description",
    "language",
    "framework",
    "library"
  ];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?title | ?description | ?language | ?library",
      description: "Change your previous filled in "
    };
  }

  public canUseInChannel(channel: Discord.TextChannel): boolean {
    return channel.name.startsWith("ticket");
  }

  public async process(commandData: CommandData): Promise<void> {
    let ticketId = (commandData.message.channel as TextChannel).name.replace(
      "ticket",
      ""
    );

    new ApiRequestHandler()
      .requestAPIWithType<Ticket>("GET", null, `ticket/${ticketId}`)
      .then(async ticket => {
        let action = commandData.message.content
          .toLowerCase()
          .slice(1)
          .split(" ");

        // get title, description, language or framework
        let identifier = action[0].substring(
          ConfigManager.GetConfig().prefix.length
        );
        if (!identifier) {
          commandData.message.channel.send(
            `You must provide an identifier to change data for. (Title, Description, Language, Framework)`
          );
          return;
        }

        const reactionHandler = new TicketProficiencyDialogue();
        const collectedInfo = new TicketDialogueData();

        if (identifier === "language") {
          let language = await reactionHandler.SelectLanguage(
            commandData.client,
            commandData.message.channel as TextChannel,
            commandData.message.author.id
          );
          if (language) ticket.languageId = language.id;
        } else if (identifier === "framework" || identifier === "library") {
          let framework = await reactionHandler.SelectFramework(
            commandData.client,
            commandData.message.channel as TextChannel,
            commandData.message.author.id
          );
          if (framework) ticket.frameworkId = framework.id;
        } else if (identifier === "title") {
          let d = new TicketDialogue();

          let titleStep: DialogueStep<TicketDialogueData> = new DialogueStep(
            collectedInfo,
            d.titleStep,
            "Enter a title for your ticket that quickly summarises what you are requiring assistance with: (20 - 100)",
            "Title Successful",
            "Title Unsuccessful"
          );

          let handler = new DialogueHandler([titleStep], collectedInfo);

          await handler
            .getInput(
              commandData.message.channel as TextChannel,
              commandData.message.author
            )
            .then(data => {
              ticket.subject = data.title;
            });
        } else if (identifier === "description") {
          let d = new TicketDialogue();

          let descriptionStep: DialogueStep<
            TicketDialogueData
          > = new DialogueStep(
            collectedInfo,
            d.descriptionStep,
            "Enter a description for your ticket. Please be as descriptive as possible so that whoever is assigned to help you knows in depth what you are struggling with: (60 - 700)",
            "Description Successful",
            "Description Unsuccessful"
          );

          let handler = new DialogueHandler([descriptionStep], collectedInfo);

          await handler
            .getInput(
              commandData.message.channel as TextChannel,
              commandData.message.author
            )
            .then(data => {
              ticket.description = data.description;
            });
        } else {
          commandData.message.channel.send(
            "Invalid identifier, Please use Title, Description, Framework or Language."
          );
          return;
        }

        new ApiRequestHandler()
          .requestAPIWithType<Ticket>("POST", ticket, "ticket/update")
          .then(updatedTicket => {
            let member = commandData.guild.members.get(
              updatedTicket.applicant.discordId
            );
            if (member) TicketHelper.updateTopic(member, updatedTicket);
          })
          .catch(console.error);
      })
      .catch(console.error);

    /**
         * let language = await reactionHandler.SelectLanguage(
          commandData.client,
          dm.channel as discord.DMChannel,
          commandData.message.author.id
        );
        let framework = await reactionHandler.SelectFramework(
          commandData.client,
          dm.channel as discord.DMChannel,
          commandData.message.author.id
        );
         */
  }
}
