import React from 'react';
import {IconButton} from "@material-ui/core";
import {ThemeVariant} from "@/themes/types";
import {Container} from "typescript-ioc";
import autobind from "autobind-decorator";
import {ThemeService} from "@/themes/ThemeService";
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import {SUIReactComponent} from "@/SUIReactComponent";

export class ThemeSwitchButton extends SUIReactComponent<{}, {
  theme: ThemeVariant
}> {
  private themeService = Container.get(ThemeService);

  public constructor(props) {
    super(props);
    this.state = {
      theme: this.themeService.getValue()
    };
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
  private changeTheme() {
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
