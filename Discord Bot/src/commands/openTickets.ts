import { IBot, IBotCommand, IBotCommandHelp, IBotMessage, IBotConfig } from '../api'
import { getRandomInt } from '../utils'
import * as discord from 'discord.js'
import { apiRequestHandler } from '../handlers/apiRequestHandler';

export default class BotInfoCommand implements IBotCommand {
    public canUseCommand(roles: discord.Role[]) {
        let helpObj: IBotCommandHelp = this.getHelp();
        let canUseCommand = true;

        if (helpObj.roles != null && helpObj.roles.length > 0) {
            canUseCommand = false;

            for (var i = 0;i < helpObj.roles.length; i++) {
                var cmdRole = helpObj.roles[i];
                if (roles.find(role => role.name.toLowerCase() == cmdRole.toLowerCase()))
                    canUseCommand = true;
            }
        }

        return canUseCommand;
    }
    private readonly CMD_REGEXP = /^\?opentickets/im

    public getHelp(): IBotCommandHelp {
        return { caption: '?opentickets', description: 'Sends a list of all joinable tickets to your dms', roles: ["admin", "happy to help"] }
    }

    public canUseInChannel(channel: discord.TextChannel): boolean {
        return !channel.name.toLowerCase().startsWith("ticket");
    }

    public init(bot: IBot, dataPath: string): void { }

    public isValid(msg: string): boolean {
        return this.CMD_REGEXP.test(msg)
    }

    public async process(msg: string, answer: IBotMessage, message: discord.Message, client: discord.Client, config: IBotConfig, commands: IBotCommand[]): Promise<void> {
        let embed = new discord.RichEmbed()
            .setColor("#ff0000")
            .setTitle("All open tickets");

        new apiRequestHandler(client, config)

            // Set params for requestAPI
            .requestAPIWithType<{ id: number, count: number, subject: string, description: string }[]>('GET',
                null, `https://api.dapperdino.co.uk/api/ticket/opentickets`, config)

            // When everything went right, we receive a ticket back, so we add the h2h-er to the ticket channel
            .then(tickets => {

                for (let i = 0; i < tickets.length; i++) {
                    let ticket = tickets[i];

                    let channel = message.guild.channels.find(x => x.name.toLowerCase() === `ticket${ticket.id}`);

                    // TODO: ticket might be closed
                    if (channel == null) continue;

                    embed.addField(`Ticket${ticket.id} (${ticket.count} team member(s) helping)`, ticket.subject + "\n https://dapperdino.co.uk/HappyToHelp/Ticket?id=" + ticket.id);

                    // Yikes 25 field fix
                    if (i % 25 == 0) {
                        message.author.send(embed);
                        embed = new discord.RichEmbed()
                            .setColor("#ff0000")
                            .setTitle("All open tickets");
                    }
                }

                message.author.send(embed);
            });
    }
}