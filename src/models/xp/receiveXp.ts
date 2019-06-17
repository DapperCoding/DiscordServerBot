import { postXp } from './postXp';

export interface receiveXp extends postXp{
    level: number;
}

export class receiveXp implements receiveXp {

}