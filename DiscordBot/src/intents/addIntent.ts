import BaseIntent from "../baseIntent";
import { TextChannel } from "discord.js";
import { Faq } from "../models/faq/faq";
import { FaqDialogue } from "../dialogues/faqDialogue";
import { DialogueStep, DialogueHandler } from "../handlers/dialogueHandler";
import { IntentData } from "../models/intentData";

export default class AddIntent extends BaseIntent {
  intent = "faq.add";

  public async process(intentData: IntentData): Promise<void> {
    if (
      intentData.message.member.roles.find(
        role =>
          role.name.toLowerCase() === "happy to help" ||
          role.name.toLowerCase() === "admin"
      )
    ) {
      let faqModel = new Faq();
      let dialogue = new FaqDialogue(
        intentData.message.channel as TextChannel,
        intentData.message.member,
        intentData.client
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
          intentData.message.channel as TextChannel,
          intentData.message.author
        )
        .then(faq => {
          dialogue.finalizeSteps(faq);
        });

      intentData.message.delete(0);
    }
  }
}
