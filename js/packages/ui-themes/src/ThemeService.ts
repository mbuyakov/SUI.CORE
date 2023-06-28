import {SuiThemeCompiled, SuiThemeVariants} from "./types";
import {EventManager} from "@sui/lib-event-manager";
import {ThemeChangedEvent} from "./ThemeChangedEvent";
import {Container, SingletonAndOnlyIoc} from "@sui/deps-ioc";
import {LocalStorageService, LSKeyWrapper} from "@sui/lib-storage";

abstract class ThemeService extends EventManager<ThemeChangedEvent> {
  public abstract getBrowserTheme(): SuiThemeVariants;

  public abstract getCurrentTheme(): SuiThemeVariants;

  public abstract getCompiledTheme(): SuiThemeCompiled;

  public abstract setCurrentTheme(theme: SuiThemeVariants): void;
}

export class ThemeServiceImpl extends ThemeService {
  private themeVariant: LSKeyWrapper<SuiThemeVariants> = Container.get(LocalStorageService).getKeyWrapper("theme");
  private readonly compiledTheme: SuiThemeCompiled;

  constructor(compiledTheme: SuiThemeCompiled) {
    super();
    this.compiledTheme = compiledTheme;
    if (!this.themeVariant.get()) {
      this.themeVariant.set(this.getBrowserTheme());
    }
    document.body.setAttribute("data-theme", this.themeVariant.get()!);
  }

  getBrowserTheme(): SuiThemeVariants {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  setCurrentTheme(theme: SuiThemeVariants): void {
    this.themeVariant.set(theme);
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(ThemeChangedEvent, new ThemeChangedEvent(theme));
    document.body.setAttribute("data-theme", theme);
  }

  getCurrentTheme(): SuiThemeVariants {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.themeVariant.get()!;
  }

  getCompiledTheme(): SuiThemeCompiled {
    return this.compiledTheme;
  }
}

const _ThemeService = SingletonAndOnlyIoc(ThemeService);
export {_ThemeService as ThemeService};
