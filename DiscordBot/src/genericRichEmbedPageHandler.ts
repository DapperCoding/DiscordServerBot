import { RichEmbed, Message } from "discord.js";

export class GenericRichEmbedPageHandler<T> {
  data: T[];
  itemsPerPage: number;
  itemHandler: (embed: RichEmbed, data: T[]) => RichEmbed;
  currentPage: number = 1;
  amountOfPages: number;
  embed: RichEmbed;
  message: Message;

  /**
   *
   */
  constructor(
    data: T[],
    itemsPerPage: number,
    itemHandler: (embed: RichEmbed, data: T[]) => RichEmbed,
    embed: RichEmbed,
    message: Message
  ) {
    this.data = data;
    this.itemsPerPage = itemsPerPage;
    this.itemHandler = itemHandler;
    this.embed = embed;
    this.message = message;

    let totalPages = Math.floor(data.length / itemsPerPage);

    if (data.length % itemsPerPage != 0) {
      totalPages++;
    }

    this.amountOfPages = totalPages;
  }

  public NextPage = () => {
    if (this.currentPage == this.amountOfPages) {
      this.currentPage = 1;
    } else {
      this.currentPage++;
    }

    this.showPage();
  };

  public PreviousPage = () => {
    if (this.currentPage == 1) {
      this.currentPage = this.amountOfPages;
    } else {
      this.currentPage--;
    }

    this.showPage();
  };

  public GetPageNumber = () => this.currentPage;

  public showPage() {
    // Get the start index, if page == 1, the index is 0
    let start =
      this.currentPage == 1 ? 0 : (this.currentPage - 1) * this.itemsPerPage;

    // Get the end index
    let end =
      this.itemsPerPage * this.currentPage > this.data.length
        ? this.data.length
        : this.itemsPerPage * this.currentPage;

    // Get the section of the data you want to show
    let data = this.data.slice(start, end);

    // Reset fields
    this.embed.fields = [];

    // Set embed fields
    this.embed = this.itemHandler(this.embed, data);

    // Update the message
    this.message.edit(this.embed);
  }
}
