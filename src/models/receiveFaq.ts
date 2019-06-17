import { faq } from "./faq";

export interface receiveFaq extends faq {
    MessageId: string;
}

export class receiveFaq implements receiveFaq {

}

export default receiveFaq;