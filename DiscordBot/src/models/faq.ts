import { ResourceLink } from "./resourceLink";

export interface Faq {
    id: number;
    description: string;
    question: string;
    answer: string;
    resourceLink: ResourceLink;
}

export class Faq implements Faq {

}