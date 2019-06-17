import * as discord from 'discord.js';
import * as api from '../api';
import { apiRequestHandler } from './apiRequestHandler';
import { postXp } from '../models/xp/postXp';
import { compactDiscordUser } from '../models/compactDiscordUser';
import { receiveXp } from '../models/xp/receiveXp';
import { compactPostXp } from '../models/xp/compactPostXp';

export class xpHandler {
    private _config: api.IBotConfig;

    constructor(config: api.IBotConfig) {
        this._config = config;
    }

    private baseUrl = 'https://api.dapperdino.co.uk/api/xp/';

    public async IncreaseXpOnMessage(message: discord.Message) {
        let userXpURL = this.baseUrl + message.author.id;

        let xpObject: postXp = new postXp();
        let xpValue = Math.floor(Math.random() * 10) + 5;
        xpObject.xp = xpValue;
        xpObject.discordId = message.author.id;
        xpObject.username = message.author.username;

        new apiRequestHandler().requestAPI("POST", xpObject, userXpURL, this._config)
    }

    public async IncreaseXp(message: discord.Message, xp: number) {
        let userXpURL = this.baseUrl +  message.author.id;

        let xpObject: postXp = new postXp();
        xpObject.xp = xp;
        xpObject.discordId = message.author.id;
        xpObject.username = message.author.username;

        new apiRequestHandler().requestAPI("POST", xpObject, userXpURL, this._config)
    }

    public async IncreaseXpDefault(discordId:string, xp:number){
        let userXpURL = this.baseUrl +  discordId;

        let xpObject: compactPostXp = new compactPostXp();
        xpObject.xp = xp;

        new apiRequestHandler().requestAPI("POST", xpObject, userXpURL, this._config)
    }

    public async GetLevelData() {

        new apiRequestHandler().requestAPI("GET", null, this.baseUrl, this._config)
            .then((xpArray) => {
                console.log(xpArray);
            });
    }

    public async getLevelDataById(discordId: number) {

        // Return new Promise<receiveXp>
        return new Promise<receiveXp>(async (resolve, reject) => {

            // Create xp url
            let xpUrl = `${this.baseUrl}${discordId}`

            // Request API
            new apiRequestHandler()
                .requestAPIWithType<receiveXp>("GET", null, xpUrl, this._config)
                .then((xpReturnObject) => {
                    
                    // Resolve if all went okay
                    return resolve(xpReturnObject);
                });
        })
    }
}