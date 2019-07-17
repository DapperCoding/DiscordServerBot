import { WebsiteBotService } from "../services/websiteBotService";
import { ApiBotService } from "../services/apiBotService";
import { MessageService } from "../services/messageService";

export class ServiceHelper {
  private static websiteService: WebsiteBotService | null = null;
  private static apiService: ApiBotService | null = null;
  private static messageService: MessageService | null = null;

  public static setWebsiteService(websiteService) {
    this.websiteService = websiteService;
  }

  public static getWebsiteService() {
    return this.websiteService;
  }

  public static setApiService(apiService) {
    this.apiService = apiService;
  }

  public static getApiService() {
    return this.apiService;
  }

  public static setMessageService(messageService: MessageService) {
    this.messageService = messageService;
  }

  public static getMessageService() {
    return this.messageService;
  }
}
