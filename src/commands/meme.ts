import {
  IBot,
  IBotCommand,
  IBotCommandHelp,
  IBotMessage,
  IBotConfig
} from "../api";
import { getRandomInt } from "../utils";
import * as discord from "discord.js";
import BaseCommand from "../baseCommand";
import * as fetch from "node-fetch";

export default class MemeCommand extends BaseCommand {
  /**
   *
   */
  constructor() {
    super(/^\?meme/im);
  }

  public getHelp(): IBotCommandHelp {
    return {
      caption: "?meme",
      description: "Sends a meme, can only be used in the #memes channel"
    };
  }

  public init(bot: IBot, dataPath: string): void {}

  public canUseInChannel(channel: discord.TextChannel): boolean {
    return channel.name.toLowerCase() === "memes";
  }

  public async process(
    msg: string,
    answer: IBotMessage,
    message: discord.Message,
    client: discord.Client,
    config: IBotConfig,
    commands: IBotCommand[]
  ): Promise<void> {
    // Split content on spaces to check for a query
    const splitted = message.content.split(" ");

    // If we found more than one word
    if (splitted.length > 1) {
      // Remove first word (?meme) and join them together
      splitted.shift();

      // Search query
      const query = splitted.join(" ");

      // Search on Reddit
      fetch
        .default(
          `https://www.reddit.com/search/.json?q='${query}'&sort=top&t=day&limit=350`
        )
        .then(res => {
          // Send embed
          this.sendEmbed(res, message, query);
        });

      return;
    }

    // Get top memes
    fetch
      .default(
        "https://www.reddit.com/u/kerdaloo/m/dankmemer/top/.json?sort=top&t=day&limit=350"
      )
      .then(res => {
        // Now send the embed
        this.sendEmbed(res, message, null);
      });
  }

  private sendEmbed(res: any, message: discord.Message, query: string | null) {
    // Get random meme
    let post = res.body.data.children.filter(
      child =>
        child.data.title != null &&
        ((child.data.url as string).endsWith(".jpg") ||
          (child.data.url as string).endsWith(".png") ||
          (child.data.url as string).endsWith(".gif"))
    )[Math.floor(Math.random() * res.body.data.children.length)]; // :v

    if (!post)
      post =
        res.body.data.children[
          Math.floor(Math.random() * res.body.data.children.length)
        ];

    if (!post) message.channel.send("Couldn't find any memes");

    let title = post.data.title as string;

    if (title.length > 256) title = title.substring(0, 256);

    // Create meme embed
    let memeEmbed = new discord.RichEmbed()

      // Set the title to the post title
      .setTitle(title)

      // Set color of embed to a random color
      .setColor(this.colors[Math.floor(Math.random() * this.colors.length)])

      // Set timestamp to current time
      .setTimestamp()

      // Set footer to 'posted by mickie456' if author was mickie456
      .setFooter(`posted by ${post.data.author}`);

    if (
      (post.data.url as string).endsWith(".jpg") ||
      (post.data.url as string).endsWith(".png") ||
      (post.data.url as string).endsWith(".gif")
    ) {
      memeEmbed.setImage(post.data.url);
    } else {
      memeEmbed.setURL(post.data.url);
      memeEmbed.addField(
        "Image",
        "Couldn't find an image, so here's the link to the post/reaction."
      );
    }

    // If there's a query added
    if (query && query.trim() != "") {
      // Add query to embed
      memeEmbed.addField("Search query:", query);
    }

    // Send embed
    message.channel.send(memeEmbed);
  }

  private colors = [0x7d5bbe, 0xa3d3fe, 0x333333, 0x007acc, 0xf56154, 0xdc3522];
}
