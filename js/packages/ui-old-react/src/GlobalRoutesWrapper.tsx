import * as React from "react";
import {Container} from "@sui/deps-ioc";
import {ThemeProvider, Theme, StyledEngineProvider} from "@sui/deps-material";
import {ConfigProvider} from "@sui/deps-antd";
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
      this.setState({theme});
    });
  }

  public render(): JSX.Element {
    const curTheme = this.themeService.getCurrentTheme();

    return (
      <SuiThemeContext.Provider value={curTheme}>
        <ConfigProvider locale={localeRu}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={curTheme.muiTheme}>
              {this.props.children}
            </ThemeProvider>
          </StyledEngineProvider>
        </ConfigProvider>
      </SuiThemeContext.Provider>
    );
  }
}
