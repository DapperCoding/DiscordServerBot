import { Intent } from "./models/intent";
import { IntentData } from "./models/intentData";

export default abstract class BaseIntent implements Intent {

    public abstract intent: string;

    public isValid(intent: string): boolean {
        return this.intent === intent.toLowerCase();
    }

    public abstract process(intentData: IntentData): Promise<void>;
}