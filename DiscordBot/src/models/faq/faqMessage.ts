import { Message } from "../message";

export interface FaqMessage {
    id: number;
    message: Message;
}

export class FaqMessage implements FaqMessage {

}