import * as React from "react";
import * as ReactDOM from 'react-dom';
import {Container} from "typescript-ioc";
import {ThemeProvider} from "@material-ui/core/styles";
import {ConfigProvider} from "antd";
import {SuiThemeContext, ThemeService} from "@/themes";
import {localeRu} from "@/antdMissedExport";

export function draw(element: React.ReactElement, containerRef?: React.RefObject<never>): void {
  const theme = Container.get(ThemeService).getCurrentTheme();
  let elementContainer;

  elementContainer = containerRef && containerRef.current
    ? ReactDOM.findDOMNode(containerRef.current)
    : document.createElement('div');

  ReactDOM.render(React.createElement(SuiThemeContext.Provider, {value: theme}, React.createElement(ConfigProvider, {locale: localeRu}, React.createElement(ThemeProvider, {theme: theme.muiTheme, children: element}))), elementContainer);
}
