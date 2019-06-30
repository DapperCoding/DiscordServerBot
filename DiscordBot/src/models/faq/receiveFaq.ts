import { Faq } from "./faq";

export interface ReceiveFaq extends Faq {
    messageId: string;
}

export class ReceiveFaq implements ReceiveFaq {

}

export default ReceiveFaq;