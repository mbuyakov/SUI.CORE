import {Container, Singleton} from 'typescript-ioc';
import {ObservableLocalStorageValue} from "@/Observable";
import {CompiledTheme, CompiledThemes, ThemeVariant} from "@/themes/types";
import themeSwitcher from 'theme-switcher';
import autobind from 'autobind-decorator';
import {getCompiledThemes} from "@/themes/utils";
import {Logger} from "@sui/core";


@Singleton
export class ThemeService extends ObservableLocalStorageValue<ThemeVariant> {

  private readonly log = new Logger("ThemeService");
  private readonly compiledThemes: CompiledThemes;
  private readonly themeSwitcher: ReturnType<typeof themeSwitcher>["switcher"];

  private static detectBrowserTheme(): ThemeVariant {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }

    return "light";
  }

  @autobind
  public getCurrentTheme(): CompiledTheme {
    return this.compiledThemes[this.getValue()];
  }

  constructor() {
    super("theme", ThemeService.detectBrowserTheme);

    const {switcher} = themeSwitcher({
      themeMap: {
        dark: '/theme/dark.css'
      }
    });
    this.themeSwitcher = switcher;
    super.subscribe(this.onThemeChange, true);
    this.compiledThemes = getCompiledThemes(Container.getValue("sui.themes"));
  }

  @autobind
  private onThemeChange(theme: ThemeVariant, oldTheme: ThemeVariant) {
    this.log.info(`Theme changed: ${oldTheme}->${theme}`);
    this.themeSwitcher({theme});
  }
}
