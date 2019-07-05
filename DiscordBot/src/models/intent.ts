import { IntentData } from "./intentData";

export interface Intent {
    readonly intent: string;
    isValid(intentWord: string): boolean;
    process(intentData: IntentData): Promise<void>;
}

export class Intent implements Intent {

}