import * as React from "react";
import {ThemeService, ThemeVariant} from "@/themes";
import {Container} from "typescript-ioc"
import {ThemeProvider} from '@material-ui/core/styles';
import {ConfigProvider} from 'antd';
import ru_RU from 'antd/es/locale/ru_RU';


export default class GlobalRoutesWrapper extends React.Component<{}, {
  theme: ThemeVariant
}> {
  private readonly themeService = Container.get(ThemeService);

  public constructor(props) {
    super(props);
    this.state = {
      theme: this.themeService.getValue()
    };
    this.themeService.subscribe(theme => {
      this.setState({theme})
    })
  }

  public render(): JSX.Element {
    return (
      <ConfigProvider locale={ru_RU}>
        <ThemeProvider theme={this.themeService.getCurrentTheme().muiTheme}>
          {this.props.children}
        </ThemeProvider>
      </ConfigProvider>
    );
  }
}
