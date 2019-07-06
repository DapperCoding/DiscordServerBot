const request = require("request");
import * as fs from "fs";
import * as Discord from "discord.js";
import { ConfigManager } from "../configManager";
export class ApiRequestHandler {
  constructor(serverBot?: Discord.Client) {
    if (serverBot) this._serverBot = serverBot;
  }
  private static bearerToken = "";

  private _headers = {
    "User-Agent": "DapperBot/0.0.1",
    "Content-Type": "application/json",
    Authorization: ``
  };
  private _serverBot?: Discord.Client;

  public async requestAPI(
    httpType:
      | "POST"
      | "DELETE"
      | "PUT"
      | "PATCH"
      | "GET"
      | "HEAD"
      | "OPTIONS"
      | "CONNECT"
      | "TRACE",
    data: any,
    requestUrl: string
  ) {
    return new Promise<apiBody>(async (resolve, reject) => {
      const config = ConfigManager.GetConfig();
      const token = ConfigManager.GetMemoryConfig("bearer");
      this._headers.Authorization = `Bearer ${token}`;
      const apiUrl = config.apiUrl;

      var options = {
        url: apiUrl + requestUrl,
        method: httpType,
        headers: this._headers,
        json: data
      };

      await request(options, (error: any, response: any, body: any) => {
        if (response) {
          if (
            (!error && response.statusCode == 200) ||
            response.statusCode == 201
          ) {
            resolve(body);
            return;
          } else if (response.statusCode == 401) {
            console.log(response.statusCode, error);
            resolve(this.generateNewToken(options));
            return;
          } else if (response.statusCode == 400) {
            console.error(response.body);
            reject(response.body);
            return;
          } else if (response.statusCode == 403) {
            console.log("Unauthorized");
            reject("403");
            return;
          } else if (response.statusCode == 500 && this._serverBot && config) {
            let guild = this._serverBot.guilds.get(config.serverId);

            if (!guild) return "Configured server not found";

            let channel = guild.channels.find(
              c => c.name == "web-error-log"
            ) as Discord.TextChannel;

            if (!channel) return "web-error-log channel not found";

            channel.send(response);

            console.log("test");
            return;
          }
        }
      });
    });
  }

  public async requestAPIWithType<T>(
    httpType:
      | "POST"
      | "DELETE"
      | "PUT"
      | "PATCH"
      | "GET"
      | "HEAD"
      | "OPTIONS"
      | "CONNECT"
      | "TRACE",
    data: any,
    requestUrl: string
  ) {
    return new Promise<T>(async (resolve, reject) => {
      const config = ConfigManager.GetConfig();
      this._headers.Authorization = `Bearer ${config.apiBearerToken}`;
      const apiUrl = config.apiUrl;
      var options = {
        url: apiUrl + requestUrl,
        method: httpType,
        headers: this._headers,
        json: data
      };

      return await request(options, (error: any, response: any, body: any) => {
        if (response) console.log(response.statusCode);
        if (
          (!error && response.statusCode == 200) ||
          response.statusCode == 201
        ) {
          if (typeof body == "string") {
            resolve(JSON.parse(body) as T);
          }

          resolve(body as T);
          return;
        } else if (response.statusCode == 401) {
          console.log(response.statusCode, error);

          resolve(this.generateNewTokenWithType<T>(options));
          return;
        } else if (response.statusCode == 400) {
          console.error(response.body);
          return reject(response.body);
        } else if (response.statusCode == 403) {
          console.log("Unauthorized");
          reject("403");
          return;
        } else if (response.statusCode == 500) {
          reject("500");
          return;
        }
      });
    });
  }

  public async generateNewToken(first_options: any) {
    return new Promise<apiBody>(async (resolve, reject) => {
      const config = ConfigManager.GetConfig();
      const baseUrl = config.apiUrl;
      var options = {
        url: baseUrl + "/account/login",
        method: "POST",
        headers: this._headers,
        json: {
          Email: config.apiEmail,
          Password: config.apiPassword
        }
      };
      try {
        request(options, async (error: any, response: any, body: any) => {
          if (!error && response.statusCode == 200) {
            ConfigManager.SetMemoryConfig("bearer", body);
            config.apiBearerToken = body;

            first_options.Authorization = `Bearer ${body}`;

            return this.retry(first_options).then(async opt => {
              return resolve(opt as apiBody);
            });
            // Try the request again AFTER letting the bot login
          } else {
            // Something is wrong, maybe a wrong password
            console.error(
              `We tried to let the bot login but we got HTTP code:${
                response.statusCode
              }`
            );
            if (body) {
              console.log(`With body: ${body}`);
            }
          }
        })
          .then(async a => {
            return resolve();
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      } catch (error) {}
    });
  }

  public async generateNewTokenWithType<T>(first_options: any) {
    return new Promise<T>(async (resolve, reject) => {
      const config = ConfigManager.GetConfig();
      const baseUrl = config.apiUrl;
      var options = {
        url: baseUrl + "/account/login",
        method: "POST",
        headers: this._headers,
        json: {
          Email: config.apiEmail,
          Password: config.apiPassword
        }
      };
      try {
        request(options, async (error: any, response: any, body: any) => {
          if (!error && response.statusCode == 200) {
            ConfigManager.SetMemoryConfig("bearer", body);

            first_options.Authorization = `Bearer ${body}`;

            return this.retryWithType<T>(first_options).then(async opt => {
              return await resolve(opt as T);
            });
            // Try the request again AFTER letting the bot login
          } else {
            // Something is wrong, maybe a wrong password
            console.error(
              `We tried to let the bot login but we got HTTP code:${
                response.statusCode
              }`
            );
            if (body) {
              console.log(`With body: ${body}`);
            }
          }
        }).then(async a => {
          return resolve();
        });
      } catch (error) {}
    });
  }

  public async retry<apiBody>(previousOptions) {
    // Create new Promise
    return new Promise<apiBody>(
      // With a parameter thats a function that has 2 params: resolve,reject => resolve = returns OK, reject = ERROR
      async (resolve, reject) => {
        // Return the request
        return await request(
          previousOptions,
          (error: any, response: any, body: string) => {
            // Refactor to file
            let errorCodes: Array<Number> = new Array<Number>(
              404,
              500,
              501,
              502,
              503,
              504,
              505,
              506,
              507,
              508,
              509,
              510
            );
            let authCodes: Array<Number> = new Array<Number>(
              400,
              401,
              402,
              403,
              405,
              406
            );

            // Check for errors
            if (
              !error &&
              // error codes
              errorCodes.indexOf(response.statusCode) < 0 &&
              // auth
              authCodes.indexOf(response.statusCode) < 0
            ) {
              // let it resolve in an apiBody
              return resolve();
            } else if (!error && response.statusCode == 401) {
              console.error("Not authenticated ");
            }
          }
        );
      }
    );
  }

  public async retryWithType<T>(previousOptions) {
    // Create new Promise
    return new Promise<T>(
      // With a parameter thats a function that has 2 params: resolve,reject => resolve = returns OK, reject = ERROR
      async (resolve, reject) => {
        // Return the request
        return await request(
          previousOptions,
          (error: any, response: any, body: any) => {
            // Refactor to file
            let errorCodes: Array<Number> = new Array<Number>(
              404,
              500,
              501,
              502,
              503,
              504,
              505,
              506,
              507,
              508,
              509,
              510
            );
            let authCodes: Array<Number> = new Array<Number>(
              400,
              401,
              402,
              403,
              405,
              406
            );

            // Check for errors
            if (
              !error &&
              // error codes
              errorCodes.indexOf(response.statusCode) < 0 &&
              // auth
              authCodes.indexOf(response.statusCode) < 0
            ) {
              // let it resolve in an apiBody
              return resolve(JSON.parse(body) as T);
            } else if (!error && response.statusCode == 401) {
              console.error("Not authenticated ");
            }
          }
        );
      }
    );
  }

  public async writeToFile(config) {
    return new Promise(async (resolve, reject) => {
      await fs.writeFile("../bot.prod.json", JSON.stringify(config), err => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

export interface iApiBody {
  data: any;
}
export class apiBody implements iApiBody {
  data: any;
}
