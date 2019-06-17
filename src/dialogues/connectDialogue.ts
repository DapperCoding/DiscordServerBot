import * as discord from "discord.js";
import * as api from "../api";
import { connectHandler } from "../handlers/connectHandler";

export class connectDialogue {


    
    private _config: api.IBotConfig;
    private _channel: discord.TextChannel;
    private _user: discord.GuildMember;
    private _bot: discord.Client;

    /**
     * Create dialogue for the connect command
     */
    constructor(config: api.IBotConfig, channel:discord.TextChannel, user:discord.GuildMember, bot:discord.Client) {
        this._config = config;
        this._channel=channel;
        this._user = user;
        this._bot = bot;
    }
    
    /**
     * getConnectCode
     */
    public getConnectCode(response: discord.Message, data: boolean) {
        return new Promise<boolean>((resolve, reject) => {

            try {

                new connectHandler(this._bot, this._config)
            .registerDiscord(response)
            .then()

                return resolve(data);

            } catch (e) {

                return reject(e);
            }

        });
    }
   
}