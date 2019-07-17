export class SuggestionConverters {
  public static suggestionTypeText = (type: number) => {
    switch (type) {
      case 0:
        return "Bot";
      case 1:
        return "Website";
      case 2:
        return "General";
      case 3:
        return "YouTube";
      case 4:
        return "Undecided";
      default:
        return "Undecided";
    }
  };

  public static suggestionStatusText = (type: number) => {
    switch (type) {
      case 0:
        return "Abandoned";
      case 1:
        return "WorkInProgress";
      case 2:
        return "InConsideration";
      case 3:
        return "Completed";
      case 4:
        return "Future";
      default:
        return "NotLookedAt";
    }
  };
}
