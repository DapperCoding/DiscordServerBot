import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import { Faq } from "../models/faq/faq";
import { DialogueHandler, DialogueStep } from "../handlers/dialogueHandler";
import { FaqDialogue } from "../dialogues/faqDialogue";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";

export default class AddFaqCommand extends BaseCommand {
  readonly commandWords = ["addfaq"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?addfaq",
      description: "Creates a new entry to the FAQ channel, follow the prompts",
      roles: ["admin", "happy to help"]
    };
  }

  public canUseInChannel(): boolean {
    return true;
  }

  public async process(commandData: CommandData): Promise<void> {
    let faqModel = new Faq();
    let dialogue = new FaqDialogue(
      commandData.message.channel as Discord.TextChannel,
      commandData.message.member,
      commandData.client
    );

    let questionStep: DialogueStep<Faq> = new DialogueStep<Faq>(
      faqModel,
      dialogue.addQuestion,
      "Enter Question:",
      "Question Successful",
      "Question Unsuccessful"
    );

    let answerStep: DialogueStep<Faq> = new DialogueStep<Faq>(
      faqModel,
      dialogue.addAnswer,
      "Enter Answer:",
      "Answer Successful",
      "Answer Unsuccessful"
    );

    let faqUrlVerifyStep: DialogueStep<Faq> = new DialogueStep(
      faqModel,
      dialogue.startUsefulResource,
      "Would you like to add a resourceful URL related to the FAQ? (Enter 'Yes' if so, otherwise enter 'No')",
      "URL Choice Successful",
      "URL Choice Unsuccessful"
    );

    let handler = new DialogueHandler(
      [questionStep, answerStep, faqUrlVerifyStep],
      faqModel
    );

    await handler
      .getInput(
        commandData.message.channel as Discord.TextChannel,
        commandData.message.member
      )
      .then(faq => {
        dialogue.finalizeSteps(faq);
      });

    commandData.message.delete(0);
  }
}
