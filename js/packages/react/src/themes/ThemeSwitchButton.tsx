import {IconButton} from "@material-ui/core";
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import autobind from "autobind-decorator";
import React from 'react';
import {Container} from "typescript-ioc";
import {ThemeVariant} from "@/themes/types";
import {ThemeService} from "@/themes/ThemeService";
import {SUIReactComponent} from "@/SUIReactComponent";

type IThemeSwitchButtonProps = Record<string, never>;

interface IThemeSwitchButtonState {
  theme: ThemeVariant;
}

export class ThemeSwitchButton extends SUIReactComponent<IThemeSwitchButtonProps, IThemeSwitchButtonState> {
  private themeService = Container.get(ThemeService);

  public constructor(props: IThemeSwitchButtonProps) {
    super(props);
    this.state = {theme: this.themeService.getValue()};
    this.registerObservableHandler(this.themeService.subscribe(theme => this.setState({theme})));
  }

  public render(): JSX.Element {
    return (
      <IconButton onClick={this.changeTheme}>
        {this.state.theme == "dark" ? (<Brightness7Icon/>) : (<Brightness4Icon/>)}
      </IconButton>
    );
  }

  @autobind
  private changeTheme(): void {
    switch (this.state.theme) {
      case "dark":
        this.themeService.setValue("light");
        break;
      case "light":
        this.themeService.setValue("dark");
        break;
    }
  }
}
