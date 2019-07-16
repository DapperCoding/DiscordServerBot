import {
  RichEmbed,
  Message,
  MessageReaction,
  User,
  ReactionCollector
} from "discord.js";

export abstract class GenericRichEmbedReactionHandler<
  T extends {
    clickHandler: (data: T) => Promise<{ embed: RichEmbed; category: string }>;
  }
> {
  /**
   *
   */
  categories: // category id
  Map<
    string,
    Map<
      // emoji name
      string,
      T
    >
  > = new Map<
    string,
    Map<
      // emoji name
      string,
      T
    >
  >();

  embed: RichEmbed;
  message: Message;
  authorId: string = "";
  collector: ReactionCollector | null = null;
  currentCategory: Map<
    // emoji name
    string,
    T
  > = new Map();
  constructor(embed: RichEmbed, message: Message) {
    this.embed = embed;
    this.message = message;
  }
  public abstract setCurrentCategory(category: string): void;
  public abstract addCategory(
    categoryName: string,
    category: Map<string, T>
  ): Map<string, T>;
  public abstract addEmoji(
    categoryName: string,
    emojiName: string,
    emoji: T
  ): T;
  public abstract getEmoji(emojiName: string): T;
  public getEmbed(): RichEmbed {
    return this.embed;
  }

  public async handleEmojiClick(emoji: string) {
    if (this.currentCategory == null) throw new Error("Whoops no category");

    let data = this.currentCategory.get(emoji);

    if (!data) throw new Error("Whoops no emoji found");

    // Handle click for current emoji
    let result = await data.clickHandler(data);

    this.embed = result.embed;

    this.setCurrentCategory(result.category);

    this.message.edit(result.embed);
    this.startCollecting(this.authorId);
  }

  public stopCollecting() {
    if (this.collector) this.collector.stop("Stopped by using stop collecting");
  }

  public async startCollecting(authorId: string = "") {
    if (
      (!this.authorId || this.authorId == "") &&
      (!authorId || authorId == "")
    ) {
      throw new Error("Cannot start collecting if author id isn't available");
    }

    if (authorId && authorId != "") this.authorId = authorId;

    const filter = (reaction: MessageReaction, user: User) =>
      // Check if emoji is ◀ or ▶
      this.currentCategory.get(reaction.emoji.name) != null &&
      // Check if reaction is added by command user
      user.id === authorId;

    // Create a new collector for the message,
    this.collector = this.message.createReactionCollector(filter, {
      time: 60 * 1000
    });

    // Will hit each time a reaction is collected
    this.collector.on("collect", async r => {
      // check if we want to change category, if so, set currentCategory to new category.

      this.handleEmojiClick(r.emoji.name);

      // Loop over all users for this reaction
      r.users.forEach(user => {
        // Check if user isn't a bot
        if (!user.bot) {
          // remove reaction for use
          r.remove(user);
        }
      });

      if (this.collector) this.collector.stop("collected everything");
    });

    this.collector.on("end", (collected, reason) => {
      if (
        reason != "collected everything" &&
        reason != "Stopped by using stop collecting"
      )
        this.message.delete(0);
    });

    let keys = Array.from(this.currentCategory.keys());

    for (let i = 0; i < keys.length; i++) {
      await this.message.react(keys[i]);
    }
  }
}

export class RichEmbedReactionHandler<
  T extends {
    clickHandler: (data: T) => Promise<{ embed: RichEmbed; category: string }>;
  }
> extends GenericRichEmbedReactionHandler<T> {
  public getEmoji(emojiName: string): T {
    if (!this.currentCategory) {
      throw new Error("Cannot find category");
    }

    let emoji = this.currentCategory.get(emojiName);

    if (!emoji) {
      throw new Error("Cannot find emoji");
    }

    return emoji;
  }
  public setCurrentCategory(category: string) {
    if (!this.categories || this.categories.size < 0)
      throw new Error("no categories");

    let cat = this.categories.get(category);
    if (!cat) this.categories.set(category, new Map());
    cat = this.categories.get(category);
    if (!cat) throw new Error("no category");
    this.currentCategory = cat;
  }

  public getCurrentCategory() {
    return this.currentCategory;
  }

  constructor(embed: RichEmbed, message: Message) {
    super(embed, message);
  }

  public addCategory(categoryName: string, category: Map<string, T>) {
    let cat = this.categories.get(categoryName);

    if (cat) throw "Category already exists";

    this.categories.set(categoryName, category);

    return category;
  }

  public addEmoji(categoryName: string, emojiName: string, emoji: T) {
    if (this.categories && this.categories.size > 0) {
      let cat = this.categories.get(categoryName);

      if (!cat) throw new Error("Category not found");

      let dbEmoji = cat.get(emojiName);

      if (dbEmoji) throw new Error("Emoji found");

      cat.set(emojiName, emoji);

      return emoji;
    } else throw "No categories found";
  }

  public removeEmoji(categoryName: string, emojiName: string, emoji: T) {
    if (this.categories && this.categories.size > 0) {
      let cat = this.categories.get(categoryName);

      if (!cat) throw new Error("Category not found");

      let dbEmoji = cat.get(emojiName);

      if (!dbEmoji) throw new Error("Emoji not found");

      cat.delete(emojiName);

      return emoji;
    } else throw "No categories found";
  }

  public removeIfExistsEmoji(categoryName: string, emojiName: string) {
    if (this.categories && this.categories.size > 0) {
      let cat = this.categories.get(categoryName);

      if (!cat) throw new Error("Category not found");

      let dbEmoji = cat.get(emojiName);

      if (!dbEmoji) {
        return emojiName;
      }
      cat.delete(emojiName);

      return emojiName;
    } else throw "No categories found";
  }
}
