import { TextChannel } from "discord.js";

export class ChannelHelper {
  private static welcomeChannel: TextChannel | null = null;
  private static faqChannel: TextChannel | null = null;

  public static setWelcomeChannel(welcomeChannel: TextChannel) {
    this.welcomeChannel = welcomeChannel;
  }

  public static getWelcomeChannel() {
    return this.welcomeChannel;
  }

  public static setFaqChannel(faqChannel: TextChannel) {
    this.faqChannel = faqChannel;
  }

  public static getFaqChannel() {
    return this.faqChannel;
  }
}
