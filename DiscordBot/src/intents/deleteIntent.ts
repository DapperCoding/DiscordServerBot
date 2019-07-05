import BaseIntent from "../baseIntent";
import { IntentData } from "../models/intentData";

export default class DeleteIntent extends BaseIntent {

  intent = "faq.delete";

  public async process(intentData: IntentData): Promise<void> {

    console.log("Remove faq?");
  }
}