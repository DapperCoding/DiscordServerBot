import * as Discord from 'discord.js'
import * as superAgent from 'superagent'
import { IBotCommandHelp } from '../api'
import { CommandData } from '../models/commandData';
import BaseCommand from '../baseCommand';

export default class DoggoCommand extends BaseCommand {

    readonly commandWords = ["doggo"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?doggo', description: 'Summons a good boi :3' }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return !channel.name.toLowerCase().startsWith("ticket");
    }

    public canUseCommand(roles: Discord.Role[]) {
        let helpObj: IBotCommandHelp = this.getHelp();
        let canUseCommand = true;

        if (helpObj.roles != null && helpObj.roles.length > 0) {
            canUseCommand = false;

            for (var cmdRole in helpObj.roles) {
                if (roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase()))
                    canUseCommand = true;
            }
        }

        return canUseCommand;
    }

    public async process(commandData: CommandData): Promise<void> {

        let { body } = await superAgent
            .get(`https://random.dog/woof.json`)

        let embed = new Discord.RichEmbed()

        embed.setColor("#ff0000");
        embed.setTitle("Here's a good doggo for youuuu");
        embed.setDescription("You really deserved this :)");
        embed.setImage(body.url);

        commandData.message.channel.send(embed);
    }
}