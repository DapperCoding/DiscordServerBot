import { faq } from "./faq";

export interface receiveFaq extends faq {
    messageId: string;
}

export class receiveFaq implements receiveFaq {

}

export default receiveFaq;