import * as Discord from 'discord.js';
import { IBotCommandHelp, IBot, IBotConfig } from "./api";
import { CommandData } from './models/commandData';
import { BotCommand } from './models/botCommand';

export default abstract class BaseCommand implements BotCommand {

    public abstract commandWords: string[];

    public init(bot: IBot, dataPath: string): void { }

    public isValid(message: string, config: IBotConfig): boolean {
        for (let i = 0; i < this.commandWords.length; i++) {
            const element = this.commandWords[i];
            if (message.toLowerCase().startsWith(`${config.prefix}${element}`)) {
                return true;
            }
        }
        return false;
    }

    public abstract getHelp(): IBotCommandHelp;

    public abstract process(commandData: CommandData): Promise<void>;

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return channel.name.toLowerCase() == "other";
    }

    public canUseCommand(roles: Discord.Role[]) {

        // Base method uses the implemented getHelp to get the filled help object
        let helpObj: IBotCommandHelp = this.getHelp();

        // Because by default everyone can use the command
        let canUseCommand = true;

        // Check if any roles are available
        if (helpObj.roles != null && helpObj.roles.length > 0) {

            // If so, then by default no one can use the command
            canUseCommand = false;

            // Now we'll loop over the roles to check if any of our roles 
            for (var i = 0; i < helpObj.roles.length; i++) {

                // Set 
                var cmdRole = helpObj.roles[i];
                if (roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase()))
                    canUseCommand = true;
            }
        }

        return canUseCommand;
    }
}