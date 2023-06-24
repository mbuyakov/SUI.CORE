import {SuiEvent} from "@sui/lib-event-manager";
import {SuiThemeVariants} from "./types";

export class ThemeChangedEvent extends SuiEvent {
  public readonly theme: SuiThemeVariants


  constructor(theme: SuiThemeVariants) {
    super("ThemeChangedEvent");
    this.theme = theme;
  }
}
