import BaseIntent from "../baseIntent";
import { IntentData } from "../models/intentData";
import { RichEmbed, TextChannel, Message, DMChannel } from "discord.js";
import {
  TicketDialogueData,
  TicketDialogue
} from "../dialogues/ticketDialogue";
import { RichEmbedReactionHandler } from "../genericRichEmbedReactionHandler";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";
import { TicketProficiencyDialogue } from "../dialogues/ticketProficiencyDialogue";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Ticket } from "../models/ticket/ticket";
import { Proficiency } from "../models/proficiency/proficiency";
import { Applicant } from "../models/ticket/applicant";
import { Constants } from "../constants";

export default class CreateIntent extends BaseIntent {
  intent = "ticket.create";

  public async process(intentData: IntentData): Promise<void> {
    console.log("create a ticket");

    let myEmbed = new RichEmbed()
      .setTitle("Heya, I think you might need some help!")
      .setDescription(
        "If you want to create a ticket, react with ✅ or react with ❌ if you don't "
      );

    intentData.message.channel.send(myEmbed).then(async msg => {
      if (Array.isArray(msg)) {
        msg = msg[0];
      }

      await msg.react("✅");
      await msg.react("❌");

      // Array of collected info
      let collectedInfo = new TicketDialogueData();

      let handler = new RichEmbedReactionHandler<CreateTicket>(myEmbed, msg);
      let dialogue = new TicketDialogue();

      handler.addCategory("tickets", new Map());

      handler.setCurrentCategory("tickets");

      handler.addEmoji("tickets", "✅", {
        clickHandler: async data => {
          // create ticket
          let dm = {} as Message;
          try {
            dm = (await intentData.message.author.send(
              "Create your ticket"
            )) as Message;
            intentData.message.channel.send(
              "Check your dms! You can continue creating a ticket in your dms."
            );
          } catch (e) {
            intentData.message.channel.send(
              "Please use the web portal or enable dms to use this feature."
            );
            return;
          }

          // Create category step
          let titleStep: DialogueStep<TicketDialogueData> = new DialogueStep(
            collectedInfo,
            dialogue.titleStep,
            "Enter a title for your ticket that quickly summarises what you are requiring assistance with: (20 - 100)",
            "Title Successful",
            "Title Unsuccessful"
          );

          // Create description step
          let descriptionStep: DialogueStep<
            TicketDialogueData
          > = new DialogueStep(
            collectedInfo,
            dialogue.descriptionStep,
            "Enter a description for your ticket. Please be as descriptive as possible so that whoever is assigned to help you knows in depth what you are struggling with: (60 - 700)",
            "Description Successful",
            "Description Unsuccessful"
          );

          // Create new dialogueHandler with a titleStep and descriptionStep
          let handler = new DialogueHandler(
            [titleStep, descriptionStep],
            collectedInfo
          );

          // Add current message for if the user cancels the dialogue
          //handler.addRemoveMessage(intentData.message);

          // Collect info from steps
          await handler
            .getInput(dm.channel as DMChannel, intentData.message.author, false)
            .then(async data => {
              // TODO: Create reaction handlers
              let reactionHandler = new TicketProficiencyDialogue();

              let language = await reactionHandler.SelectLanguage(
                intentData.client,
                dm.channel as DMChannel,
                intentData.message.author.id
              );
              let framework = await reactionHandler.SelectFramework(
                intentData.client,
                dm.channel as DMChannel,
                intentData.message.author.id
              );

              //API CALL
              this.apiCall(
                data,
                language,
                framework,
                intentData.message.member
              );

              // Create ticket embed
              let ticketEmbed = new RichEmbed()
                .setTitle("Ticket Created Successfully!")
                .setColor(Constants.EmbedColors.GREEN)
                .addField("Your Title:", data.title, false)
                .addField("Your Description:", data.description, false)
                .setFooter(
                  "Keep in mind you're using a free service, please wait patiently."
                );

              // Send ticketEmbed
              let chan = intentData.message.guild.channels.find(
                x => x.name === "help"
              ) as TextChannel;
              chan.send(ticketEmbed);
              (msg as Message).delete(0);
            })
            .catch(e => {
              console.error(e);
              (msg as Message).delete(0);
            });

          return { category: "tickets", embed: myEmbed };
        }
      } as CreateTicket);

      handler.addEmoji("tickets", "❌", {
        clickHandler: async data => {
          (msg as Message).delete(0);
          return { category: "tickets", embed: myEmbed };
        }
      } as CreateTicket);

      handler.startCollecting(intentData.message.author.id);
    });
  }

  apiCall = (
    data: TicketDialogueData,
    language: Proficiency,
    framework: Proficiency,
    ticketuser: any
  ) => {
    // Create new proficiency object
    let ticketObject: Ticket = new Ticket();

    // Create new applicant object
    ticketObject.applicant = new Applicant();

    // Fill properties of proficiency
    ticketObject.subject = data.title;
    ticketObject.description = data.description;

    // Fill properties of applicant
    ticketObject.applicant.username = ticketuser.displayName;
    ticketObject.applicant.discordId = ticketuser.id;
    ticketObject.languageId;
    ticketObject.frameworkId = framework.id;
    ticketObject.languageId = language.id;

    // Post request to /ticket/
    new ApiRequestHandler()

      // Create request and fill params
      .requestAPI("POST", ticketObject, "ticket")

      // If everything went well, we receive a ticketReceive object
      .then(value => {
        // Parse object
        var ticket = JSON.parse(JSON.stringify(value)) as TicketReceive;

        console.log(ticket);
      });

    return data;
  };
}

interface CreateTicket {
  clickHandler: (
    data: CreateTicket
  ) => Promise<{ embed: RichEmbed; category: string }>;
  ticket: { id: number; count: number; subject: string; description: string };
}
