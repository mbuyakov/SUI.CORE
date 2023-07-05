import * as React from "react";
import * as ReactDOM from "react-dom";
import {Container} from "@sui/deps-ioc";
import {SuiThemeProvider, ThemeService} from "@sui/ui-themes";

export function draw(element: React.ReactElement, containerRef?: React.RefObject<never>): void {
  let elementContainer = containerRef && containerRef.current
    ? ReactDOM.findDOMNode(containerRef.current) as Element
    : document.createElement("div");

  ReactDOM.render(
    React.createElement(
      SuiThemeProvider,
      {component: "base"},
      element)
    ,
    elementContainer);
}
