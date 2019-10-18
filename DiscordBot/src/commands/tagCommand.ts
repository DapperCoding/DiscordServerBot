import * as Discord from "discord.js";
import { IBotCommandHelp } from "../api";
import BaseCommand from "../baseCommand";
import { CommandData } from "../models/commandData";
import { ApiRequestHandler } from "../handlers/apiRequestHandler";
import { Ticket } from "../models/ticket/ticket";
import { TicketCreatedEvent } from "../events/shared/ticketCreated";
import { TicketReceive } from "../models/ticket/ticketReceive";
import { TicketHelper } from "../helpers/ticketHelper";

export default class MirrorCommand extends BaseCommand {
    readonly commandWords = ["tag"];

    public getHelp(): IBotCommandHelp {
        return {
            caption: "?tag {tag}",
            description: "Command was made to help H2Hs inform other individuals on what the course of action is in some scenarios.",
            roles: ["teacher", "dapper coding", "moderator"]
        };
    }

    public async process(commandData: CommandData) {

        if (!commandData.message.content.split(" ").slice(1).length) return;

        if (['hastebin', 'pastecode'].some(r => commandData.message.content.toLowerCase().split(" ")[1] === r.toLowerCase())) {
            commandData.message.channel.send(`To share your long snippets of code, you can use: 
            \`hastebin\`: https://www.hastebin.com
            \`hasteb.in\`: https://www.hasteb.in
            \`hatebin\`: https://www.hatebin.com`);
        } 
        else if (commandData.message.content.toLowerCase().split(" ")[1] === 'ask') {
            commandData.message.channel.send(`Don't ask to ask, just ask! Someone will respond if they know how to help you`);
        }
    }
}
