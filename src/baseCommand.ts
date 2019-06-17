import { IBotCommand, IBotCommandHelp, IBot, IBotConfig, IBotMessage } from "./api";
import * as discord from 'discord.js'
import { websiteBotService } from "./services/websiteBotService";


export default abstract class BaseCommand implements IBotCommand {
    
    constructor(regex:RegExp|RegExp[]) {

        if (!Array.isArray(regex)) {
            regex = [regex];
        }

        this.CMD_REGEXP = regex;
    }

    public abstract getHelp(): IBotCommandHelp;
    public abstract process(messageContent: string, answer: IBotMessage, message: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[], wbs: websiteBotService, guild: discord.Guild);

    protected CMD_REGEXP:RegExp[];

    public init(bot: IBot, dataPath: string): void {
    }

    public canUseInChannel(channel:discord.TextChannel): boolean {
        return channel.name.toLowerCase() == "other";
    }

    public isValid(msg: string): boolean {
        if (this.CMD_REGEXP == null) return true;
        let isValid = false;
        this.CMD_REGEXP.forEach(regex => {
            let bool = regex.test(msg.toLowerCase());
            if (bool) isValid = true;
        })
        return isValid;
    }

    public canUseCommand(roles:discord.Role[]) {

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