import {MuiIcons} from "@sui/deps-material";
import Icon from "@ant-design/icons";
import {Tooltip} from "@sui/deps-antd";
import * as React from "react";

import {IAntIconComponent} from "./other";

export class TooltipIcon extends React.Component<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> {
  public render(): JSX.Element {
    return (
      <Tooltip title={this.props.children} overlayStyle={this.props.style}>
        <Icon component={MuiIcons.HelpOutline as IAntIconComponent} style={{marginLeft: 4, transform: "scale(0.85) translateY(2px)", color: "#56CBF8"}}/>
      </Tooltip>
    );
  }
}
