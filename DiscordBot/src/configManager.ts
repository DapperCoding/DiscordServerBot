import { IBotConfig } from "./api";

export class ConfigManager {
  private static currentConfig = {};

  public static SetMemoryConfig(key: string, value: any) {
    this.currentConfig[key] = value;
  }

  public static GetMemoryConfig(key: string) {
    return this.currentConfig[key];
  }

  public ReadKey(key: string) {
    let cfg = require("./../bot.json") as IBotConfig;

    try {
      const cfgProd = require("./../bot.prod.json") as IBotConfig;
      cfg = { ...cfg, ...cfgProd };
    } catch {
      console.error("no production config found...");
    }

    return cfg[key];
  }

  public static GetConfig() {
    let cfg = require("./../bot.json") as IBotConfig;

    try {
      const cfgProd = require("./../bot.prod.json") as IBotConfig;
      cfg = { ...cfg, ...cfgProd };
    } catch {
      console.error("no production config found...");
    }

    return cfg;
  }
}
