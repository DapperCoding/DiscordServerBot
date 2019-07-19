import * as Discord from "discord.js";
import { ApiRequestHandler } from "./apiRequestHandler";
import { PostXp } from "../models/xp/postXp";
import { ReceiveXp } from "../models/xp/receiveXp";
import { CompactPostXp } from "../models/xp/compactPostXp";
import { ConfigManager } from "../configManager";

export class XpHandler {
  private baseUrl: string;

  constructor() {
    const config = ConfigManager.GetConfig();
    this.baseUrl = config.apiUrl + "xp/";
  }

  public static instance = new XpHandler();

  public async IncreaseXpOnMessage(message: Discord.Message) {
    let userXpURL = this.baseUrl + message.author.id;

    let xpObject: PostXp = new PostXp();
    let xpValue = Math.floor(Math.random() * 10) + 5;
    xpObject.xp = xpValue;
    xpObject.discordId = message.author.id;
    xpObject.username = message.author.username;

    new ApiRequestHandler()
      .requestAPI("POST", xpObject, userXpURL)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  public async IncreaseXp(message: Discord.Message, xp: number) {
    let userXpURL = this.baseUrl + message.author.id;

    let xpObject: PostXp = new PostXp();
    xpObject.xp = xp;
    xpObject.discordId = message.author.id;
    xpObject.username = message.author.username;

    new ApiRequestHandler().requestAPI("POST", xpObject, userXpURL);
  }

  public async IncreaseXpDefault(discordId: string, xp: number) {
    let userXpURL = this.baseUrl + discordId;

    let xpObject: CompactPostXp = new CompactPostXp();
    xpObject.xp = xp;

    new ApiRequestHandler().requestAPI("POST", xpObject, userXpURL);
  }

  public async GetLevelData() {
    new ApiRequestHandler()
      .requestAPI("GET", null, this.baseUrl)
      .then(xpArray => {
        console.log(xpArray);
      });
  }

  public async getLevelDataById(discordId: number) {
    // Return new Promise<receiveXp>
    return new Promise<ReceiveXp>(async (resolve, reject) => {
      // Create xp url
      let xpUrl = `xp/${discordId}`;

      // Request API
      new ApiRequestHandler()
        .requestAPIWithType<ReceiveXp>("GET", null, xpUrl)
        .then(xpReturnObject => {
          // Resolve if all went okay
          return resolve(xpReturnObject);
        });
    });
  }

  public async getTop100() {
    // Return new Promise<receiveXp>
    return new Promise<ReceiveXp[]>(async (resolve, reject) => {
      const url = "xp";
      // Request API
      new ApiRequestHandler()
        .requestAPIWithType<ReceiveXp[]>("GET", null, url)
        .then(xpReturnObject => {
          // Resolve if all went okay
          return resolve(xpReturnObject);
        });
    });
  }
}
