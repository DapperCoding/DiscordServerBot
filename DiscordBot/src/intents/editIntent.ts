import BaseIntent from "../baseIntent";
import { IntentData } from "../models/intentData";

export default class EditIntent extends BaseIntent {

  intent = "faq.edit";

  public async process(intentData: IntentData): Promise<void> {

    console.log("Faq edit?");
  }
}