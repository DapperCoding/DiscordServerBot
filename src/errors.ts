export interface IMissingChannelIdError {
    channelName: string,
    log: Function;
}

export class MissingChannelIdError implements IMissingChannelIdError {

    channelName: string

    constructor(channelName: string) {
        this.channelName = channelName;
    }

    public log() {
        console.error(`Please input ${this.channelName} channel id to bot.prod.json`)
    }
}

export interface IValidationError {
    message: string;
}

export class validationError implements IValidationError {
    /**
     *
     */
    constructor(message: string) {
        this.message = message;
    }

    message: string;
}

export default MissingChannelIdError; 