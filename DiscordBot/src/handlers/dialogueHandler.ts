import * as Discord from 'discord.js'
import * as API from '../api'
import { ValidationError } from '../error';
import { Bot } from '../bot';

export class DialogueHandler<T> {
    private _steps: DialogueStep<T>[] | DialogueStep<T>;
    private _data: T;
    private _currentStep: DialogueStep<T>;
    private _channel?: Discord.TextChannel;
    private _removeMessages: Discord.Message[];
    private _cancelDialogue: boolean;

    /**
     *
     */
    constructor(steps: DialogueStep<T>[] | DialogueStep<T>, data: T) {

        // Set private steps to the inputted steps 
        this._steps = steps;

        // Set private data to inputted data
        this._data = data;

        // Create array for single dialogueStep to prevent extra checks + coding
        if (!Array.isArray(this._steps)) {

            // Transform to array
            this._steps = [this._steps];
        }

        // Set current step to the first step
        this._currentStep = steps[0];

        // Create empty array
        this._removeMessages = [];

        // Initial state of cancelling the dialogue is false
        this._cancelDialogue = false;
    }


    // Used for adding 
    public addRemoveMessage(message: Discord.Message) {

        // Add message to the removeMessages list
        this._removeMessages.push(message);
    }

    public async getInput(channel: Discord.TextChannel, user: Discord.GuildMember, config: API.IBotConfig): Promise<T> {

        return new Promise<T>(async (resolve, reject) => {

            this._channel = channel;
            
            // Set in dialogue
            Bot.setIsInDialogue(this._channel.id, user.user.id, new Date())

            // Loop over each step
            for (const step of this._steps as DialogueStep<T>[]) {

                // Check if user has cancelled dialogue, then stop the loop
                if (this._cancelDialogue) break;

                // Set current step
                this._currentStep = step;

                // Filter for current user
                const filter = m => (m.member == user);

                let message = new Discord.RichEmbed()
                    .setTitle("Hi " + user.user.username)
                    .setDescription(step.beforeMessage)
                    .addField("Notification for", user)
                    .setFooter("You can cancel the process by responding with ?cancel");

                // Send before discordMessage
                await channel.send(message)
                    .then(newMsg => {
                        this._removeMessages.push(newMsg as Discord.Message);
                    });

                // Handle callback + validation
                await this.handleCallback(filter, user.id);
            }

            // Set in dialogue state to false
            Bot.removeIsInDialogue(channel.id, user.user.id)
            .catch(e => { console.error("--- dialogueHandler error (can't remove from isInDialogue)");console.error(e) });

            // Remove all messages that have been sent by looping over them (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
            this._removeMessages.forEach(message => {

                // Delete message
                message.delete(0);
            });
            
            // If the user cancelled, reject else resolve with the data that has been modified throughout the steps
            return this._cancelDialogue ? reject("User cancelled dialogue") : resolve(this._data);
        });
    }

    public async handleCallback(filter, authorId) {

        // Check if channel is null
        if (this._channel == null) {

            // Stop callback
            return;
        }

        await this._channel.awaitMessages(filter, { max: 1 })

            // If we get a response
            .then(async collected => {

                // Get first and only discordMessage
                let response = collected.first();

                // Add to removal list
                this._removeMessages.push(response);

                // Cancel the dialogue
                if (response.content === "?cancel") {

                    // Set variable _cancelDialogue to true so we can break out of the step loop
                    this._cancelDialogue = true;

                    // Stop callback
                    return;
                }

                // Try callback
                await this._currentStep

                    // Set parameters to the message response object and the modified stepdata
                    .callback(response, this._currentStep.stepData)

                    // Everything went okay
                    .then(e => {

                        // Add step data
                        this._data = e;
                    })

                    // Whoops, error
                    .catch(async e => {

                        // Check for validation errors
                        if (e instanceof ValidationError) {

                            // Check if channel isn't null
                            if (this._channel != null)

                                // Send validation error
                                this._channel.send(e.message)

                                    // If the message is sent
                                    .then(newMsg => {

                                        // Add new message to remove list
                                        this._removeMessages.push((newMsg as Discord.Message));
                                    });

                            // Retry step
                            await this.handleCallback(filter, authorId);
                        }

                        console.error(e);
                    });

                //response.delete(0);
            })
            .catch(collected => {

                // ERROR
                console.error("--- dialogueHandler error --- \n" + collected);
                if (this._channel != null)
                    this._channel.send(this._currentStep.errorMessage);
            });

    }
}

export class DialogueStep<E> implements DialogueStep<E> {
    /**
     *
     */
    constructor(stepData: E, callback: (response: any, data: E) => Promise<E>, beforeMessage: string, succeedMessage?: string, errorMessage?: string) {
        this.beforeMessage = beforeMessage;
        this.succeedMessage = succeedMessage;
        this.errorMessage = errorMessage;
        this.callback = callback;
        this.stepData = stepData;
    }
}

export interface DialogueStep<E> {
    callback: (response: any, data: E) => Promise<E>;
    stepData: E;
    beforeMessage: string;
    succeedMessage?: string;
    errorMessage?: string;
}
