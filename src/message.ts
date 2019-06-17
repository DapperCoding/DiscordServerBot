import { RichEmbed } from 'discord.js'
import { IBotMessage, IUser } from './api'

export class BotMessage implements IBotMessage {
    public readonly user: IUser
    public richText?: RichEmbed
    public text?: string

    constructor(user: IUser) {
        this.user = user
    }

    public isValid(): boolean {
        return !!this.text || !!this.richText
    }

    public setTextOnly(text: string): IBotMessage {
        if (this.richText) { throw new Error('one of rich text methods was used') }
        this.text = text
        return this
    }

    public addField(name: string, value: string, inline: boolean): IBotMessage {
        this.validateRichText().addField(name, value, inline)
        return this
    }

    public addBlankField(): IBotMessage {
        this.validateRichText().addBlankField()
        return this
    }

    public setColor(color: string | number | [number, number, number]): IBotMessage {
        this.validateRichText().setColor(color)
        return this
    }

    public setDescription(description: string): IBotMessage {
        this.validateRichText().setDescription(description)
        return this
    }

    public setFooter(text: string, icon?: string | undefined): IBotMessage {
        this.validateRichText().setFooter(text, icon)
        return this
    }

    public setImage(url: string): IBotMessage {
        this.validateRichText().setImage(url)
        return this
    }

    public setThumbnail(url: string): IBotMessage {
        this.validateRichText().setThumbnail(url)
        return this
    }

    public setTitle(title: string): IBotMessage {
        this.validateRichText().setTitle(title)
        return this
    }

    public setURL(url: string): IBotMessage {
        this.validateRichText().setURL(url)
        return this
    }

    private validateRichText(): RichEmbed {
        if (this.text) { throw new Error('setTextOnly method was used') }
        if (!this.richText) { this.richText = new RichEmbed() }
        return this.richText
    }
}