import * as Discord from "discord.js";
import * as API from "../api";
import { ConnectHandler } from "../handlers/connectHandler";

export class ConnectDialogue {
 
    private _config: API.IBotConfig;
    private _channel: Discord.TextChannel;
    private _user: Discord.GuildMember;
    private _bot: Discord.Client;

    /**
     * Create dialogue for the connect command
     */
    constructor(config: API.IBotConfig, channel:Discord.TextChannel, user:Discord.GuildMember, bot:Discord.Client) {
        this._config = config;
        this._channel=channel;
        this._user = user;
        this._bot = bot;
    }
    
    /**
     * getConnectCode
     */
    public getConnectCode(response: Discord.Message, data: boolean) {
        return new Promise<boolean>((resolve, reject) => {

            try {

                new ConnectHandler(this._bot, this._config)
            .registerDiscord(response)
            .then()

                return resolve(data);

            } catch (e) {

                return reject(e);
            }

        });
    }
   
}