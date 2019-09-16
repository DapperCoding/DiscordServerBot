import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { CommissionDialogue } from "../dialogues/commissionDialogue";
import { TextChannel } from "discord.js";

export default class AddFaqCommand extends BaseCommand {
  readonly commandWords = ["commission"];

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?commission",
      description: "Create a request for a commission by the dapper coding team"
    };
  }

  public canUseInChannel(): boolean {
    return true;
  }

  public async process(commandData: CommandData): Promise<void> {
    var dialogue = new CommissionDialogue();
    dialogue.CreateDialogue(
      commandData.client,
      commandData.message.channel as TextChannel,
      commandData.message.author.id
    );
  }
}
