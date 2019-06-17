export interface message {
    messageId: string;
    channelId: string;
    guildId: string;
    timestamp: Date;
    isEmbed: boolean;
    isDm:boolean;
    message:string;
    imageLink:string;
}

export class message implements message {
    
}