export class Constants {
  public static readonly EmbedColors= {
    YELLOW: [241, 196, 15] as RGB,
    GREEN: [0, 255, 0] as RGB,
    RED: [255, 0, 0] as RGB
  };
}

export class RoleNames {
  public static readonly TEACHER = "teacher";
  public static readonly ARCHITECT = "architect";
  public static readonly MODERATOR = "moderator";
  public static readonly DAPPER_CODING = "dapper coding";
  public static readonly HEADMASTER = "headmaster";
  public static readonly STUDENT = "student";
  public static readonly RECRUITER = "recruiter";
}

export class ChannelNames {
  public static readonly DapperPrefix = "dapper-";
  public static readonly Dapper = {
    TEAM: ChannelNames.DapperPrefix + "team",
    CODING:ChannelNames.DapperPrefix + "coding",
    RECRUITER: ChannelNames.DapperPrefix + RoleNames.RECRUITER,
    TEACHER: ChannelNames.DapperPrefix + RoleNames.TEACHER,
    ARCHITECT:ChannelNames.DapperPrefix + RoleNames.ARCHITECT,
    MODERATOR:ChannelNames.DapperPrefix + RoleNames.MODERATOR
  }
  public static readonly Commands = {
    CATEGORY_NAME: "bot commands",
    TEAM: "dapper-team-command",
    HELP: "help",
    SUGGESTION: "create-suggestion",
    OTHER: "other",
    APPLICATIONS: "applications"
  }
}

type RGB = [number,number,number];
