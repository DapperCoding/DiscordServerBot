import * as Discord from 'discord.js';
import * as API from '../api';
import { ApiRequestHandler } from './apiRequestHandler';
import { PostXp } from '../models/xp/postXp';
import { ReceiveXp } from '../models/xp/receiveXp';
import { CompactPostXp } from '../models/xp/compactPostXp';

export class XpHandler {
    private _config: API.IBotConfig;

    constructor(config: API.IBotConfig) {
        this._config = config;
    }

    private baseUrl = 'https://api.dapperdino.co.uk/api/xp/';

    public async IncreaseXpOnMessage(message: Discord.Message) {
        let userXpURL = this.baseUrl + message.author.id;

        let xpObject: PostXp = new PostXp();
        let xpValue = Math.floor(Math.random() * 10) + 5;
        xpObject.xp = xpValue;
        xpObject.discordId = message.author.id;
        xpObject.username = message.author.username;

        new ApiRequestHandler().requestAPI("POST", xpObject, userXpURL, this._config)
    }

    public async IncreaseXp(message: Discord.Message, xp: number) {
        let userXpURL = this.baseUrl +  message.author.id;

        let xpObject: PostXp = new PostXp();
        xpObject.xp = xp;
        xpObject.discordId = message.author.id;
        xpObject.username = message.author.username;

        new ApiRequestHandler().requestAPI("POST", xpObject, userXpURL, this._config)
    }

    public async IncreaseXpDefault(discordId:string, xp:number){
        let userXpURL = this.baseUrl +  discordId;

        let xpObject: CompactPostXp = new CompactPostXp();
        xpObject.xp = xp;

        new ApiRequestHandler().requestAPI("POST", xpObject, userXpURL, this._config)
    }

    public async GetLevelData() {

        new ApiRequestHandler().requestAPI("GET", null, this.baseUrl, this._config)
            .then((xpArray) => {
                console.log(xpArray);
            });
    }

    public async getLevelDataById(discordId: number) {

        // Return new Promise<receiveXp>
        return new Promise<ReceiveXp>(async (resolve, reject) => {

            // Create xp url
            let xpUrl = `${this.baseUrl}${discordId}`

            // Request API
            new ApiRequestHandler()
                .requestAPIWithType<ReceiveXp>("GET", null, xpUrl, this._config)
                .then((xpReturnObject) => {
                    
                    // Resolve if all went okay
                    return resolve(xpReturnObject);
                });
        })
    }
}