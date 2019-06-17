import * as discord from 'discord.js';
import * as api from '../api';
import { apiRequestHandler } from './apiRequestHandler';
import { faqMessage } from '../models/faq/faqMessage';
import { resolve } from 'url';
import { faq } from '../models/faq/faq';
import { receiveFaq } from '../models/faq/receiveFaq'
import * as msg from "../models/message";


export class faqHandler {
    private _config: api.IBotConfig;

    constructor(config: api.IBotConfig) {
        this._config = config;
    }

    // Create new faq item by using the API
    public async addFaq(faqObject: faq) {

        // Create new promise
        return new Promise<receiveFaq>(async (resolve, reject) => {

            // Return finished request 
            return new apiRequestHandler()
                .requestAPIWithType<receiveFaq>("POST", faqObject, 'https://api.dapperdino.co.uk/api/faq', this._config)
                .then((faqReturnObject) => {
                    return resolve(faqReturnObject);
                })
                .catch(err => { 
                    return reject(err); 
                });
        })
    }

    // Sets faq discordMessage in the database through our API
    public setFaqMessageId(message: discord.Message, faqId: number, config: api.IBotConfig) {

        // Create new faqMessage object
        let faqMessageObject = new faqMessage();

        // Fill with faq & discordMessage id
        faqMessageObject.id = faqId;

        faqMessageObject.message = new msg.message();

        faqMessageObject.message.channelId = message.channel.id;
        faqMessageObject.message.guildId = message.guild.id;
        faqMessageObject.message.isEmbed = message.embeds.length > 0;
        faqMessageObject.message.messageId = message.id;
        faqMessageObject.message.isDm = message.channel instanceof discord.DMChannel;

        faqMessageObject.message.timestamp = new Date(message.createdTimestamp);
        // Request API
        new apiRequestHandler().requestAPI("POST", faqMessageObject, 'https://api.dapperdino.co.uk/api/faq/AddMessageId', config)
    }
}