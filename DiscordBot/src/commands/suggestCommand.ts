import * as Discord from 'discord.js'
import { IBotCommandHelp, IBotConfig } from '../api'
import { DialogueStep, DialogueHandler } from '../handlers/dialogueHandler';
import { SuggestionDialogueData, SuggestionDialogue } from '../dialogues/suggestionDialogue';
import BaseCommand from '../baseCommand';
import { CommandData } from '../models/commandData';

export default class SuggestCommand extends BaseCommand {

    readonly commandWords = ["suggest"];

    public getHelp(): IBotCommandHelp {
        return { caption: '?suggest', description: 'Leave a suggestion for our server\'s bot, our website or leave a YouTube video suggestion. Just follow the prompts' }
    }

    public canUseInChannel(channel: Discord.TextChannel): boolean {
        return channel.name.toLowerCase() === "create-suggestion";
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

        let collectedInfo: SuggestionDialogueData = new SuggestionDialogueData();
        let dialogue: SuggestionDialogue = new SuggestionDialogue(commandData.message, commandData.config);

        let suggestionCategoryStep: DialogueStep<SuggestionDialogueData> = new DialogueStep(
            collectedInfo,
            dialogue.addCategory,
            "Enter the category that best suits your suggestion. Choose from 'Bot', 'Website', 'General' or 'Youtube'.",
            "Type Successful",
            "Type Unsuccessful"
        );

        let suggestionStep: DialogueStep<SuggestionDialogueData> = new DialogueStep(
            collectedInfo,
            dialogue.addDescription,
            "Enter your suggestion:",
            "Suggestion Successful",
            "Suggestion Unsuccessful");

        let handler = new DialogueHandler([suggestionCategoryStep, suggestionStep], collectedInfo);

        handler.addRemoveMessage(commandData.message);

        await handler.getInput(commandData.message.channel as Discord.TextChannel, commandData.message.member, commandData.config as IBotConfig).then(data => {
            if (data != null) {
                dialogue.handleAPI(data)
                    .then(newData => {
                        let suggestionEmbed = new Discord.RichEmbed()
                            .setTitle("Thank You For Leaving A Suggestion")
                            .setColor("#ff0000")
                            .addField(commandData.message.author.username, "Suggested Dapper Dino to: " + newData.description, false)
                            .addField("Your request has been added to Dapper's suggestions list", "Thanks for your contribution", false)
                            .setFooter("Sit tight and I might get around to your idea... eventually :D")

                        commandData.message.channel.send(suggestionEmbed);
                    })
                    .catch(err => {
                        console.error(err);
                        commandData.message.reply("Something went wrong leaving your suggestion, please contact an admin");
                    });
            }
        });
    }
}