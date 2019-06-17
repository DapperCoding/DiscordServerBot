import { resourceLink } from "./resourceLink";

export interface faq {
    id: number;
    description: string;
    question: string;
    answer: string;
    resourceLink: resourceLink
}

export class faq implements faq {

}