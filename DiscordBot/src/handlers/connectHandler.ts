import * as discord from 'discord.js';
import * as api from '../api';
import { apiRequestHandler } from './apiRequestHandler';
import { registerModel } from '../models/registerModel';
import { discordUser } from '../models/discordUser';

export class connectHandler {

    // Config used for api
    private _config: api.IBotConfig;
    private _client: discord.Client;

    constructor(client: discord.Client, config: api.IBotConfig) {

        // Register config
        this._config = config;
        this._client = client;
    }


    public async registerDiscord(message: discord.Message) {

        // Return new promise
        return new Promise(async (resolve, reject) => {

            // Register url
            let registerDiscordUrl = 'https://api.dapperdino.co.uk/api/Account/RegisterDiscord/';

            // Create new registerModel
            let model = new registerModel();

            // Add user information
            model.username = message.author.username;
            model.discordId = message.author.id;

            // Add connect code
            //model.registrationCode = message.content.replace("?connect ", "");

            if (message.member.roles.find(role => role.name.toLowerCase() === "happy to help")) {
                model.isHappyToHelp = true;
            }

            // Request API
            try {
                const discordAccount = await new apiRequestHandler(this._client, this._config)
                    .requestAPIWithType<discordUser>("POST", model, registerDiscordUrl, this._config);
                // Send okay message
                this.sendOkMessage(message, discordAccount);
                // Resolve
                return resolve(true);
            }
            catch (reason_1) {
                // Log & send reason
                console.error(reason_1);
                this.sendRejectMessage(message, reason_1);
                // Reject
                return reject(reason_1);
            }
        });
    }

    public async sendOkMessage(message: discord.Message, model) {
        message.reply("You have successfully connected your discord account");
    }

    public async sendRejectMessage(message: discord.Message, reason) {
        message.reply(reason);
    }
}