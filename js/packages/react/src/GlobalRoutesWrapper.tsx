import * as React from "react";
import {Container} from "typescript-ioc"
import {ThemeProvider} from '@material-ui/core/styles';
import {ConfigProvider} from 'antd';
import {SuiThemeContext, ThemeService, ThemeVariant} from "@/themes";
import {localeRu} from "@/antdMissedExport";

export type IGlobalRoutesWrapperProps = Record<string, never>;

export interface IGlobalRoutesWrapperState {
  theme: ThemeVariant;
}

export default class GlobalRoutesWrapper extends React.Component<IGlobalRoutesWrapperProps, IGlobalRoutesWrapperState> {
  private readonly themeService = Container.get(ThemeService);

  public constructor(props: IGlobalRoutesWrapperProps) {
    super(props);
    this.state = {
      theme: this.themeService.getValue()
    };
    this.themeService.subscribe(theme => {
      this.setState({theme})
    })
  }

  public render(): JSX.Element {
    const curTheme = this.themeService.getCurrentTheme();

    return (
      <SuiThemeContext.Provider value={curTheme}>
        <ConfigProvider locale={localeRu}>
          <ThemeProvider theme={curTheme.muiTheme}>
            {this.props.children}
          </ThemeProvider>
        </ConfigProvider>
      </SuiThemeContext.Provider>
    );
  }
}
