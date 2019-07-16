import { BotCommand } from "./models/botCommand";
import { Intent } from "./models/intent";

export interface ILoggerMethod {
  (message: string, ...args: any[]): void;
  (obj: object, message?: string, ...args: any[]): void;
}

export interface ILogger {
  debug: ILoggerMethod;
  info: ILoggerMethod;
  warn: ILoggerMethod;
  error: ILoggerMethod;
}

export interface IBotConfig {
  token: string;
  prefix: string;
  serverId: string;
  apiBearerToken: string;
  apiEmail: string;
  apiPassword: string;
  luisAppId: any;
  luisApiKey: any;
  welcomeChannel: string;
  faqChannel: string;
  apiUrl: string;
}

export interface IBotCommandHelp {
  caption: string;
  description: string;
  roles?: string[];
}

export interface IBot {
  readonly commands: BotCommand[];
  readonly intents: Intent[];
  readonly allUsers: IUser[];
  readonly onlineUsers: IUser[];
  start(logger: ILogger, config: IBotConfig, dataPath: string): void;
}

export interface IUser {
  id: string;
  username: string;
  discriminator: string;
  tag: string;
}

type MessageColor = [number, number, number] | number | string;

export interface IBotMessage {
  readonly user: IUser;
  setTextOnly(text: string): IBotMessage;
  addField(name: string, value: string, inline: boolean): IBotMessage;
  addBlankField(): IBotMessage;
  setColor(color: MessageColor): IBotMessage;
  setDescription(description: string): IBotMessage;
  setFooter(text: string, icon?: string): IBotMessage;
  setImage(url: string): IBotMessage;
  setThumbnail(url: string): IBotMessage;
  setTitle(title: string): IBotMessage;
  setURL(url: string): IBotMessage;
}
