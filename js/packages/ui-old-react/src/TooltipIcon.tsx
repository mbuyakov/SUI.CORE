import Icon from '@ant-design/icons';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {Tooltip} from 'antd';
import * as React from 'react';

import {IAntIconComponent} from './other';

export class TooltipIcon extends React.Component<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> {
  public render(): JSX.Element {
    return (
      <Tooltip title={this.props.children} overlayStyle={this.props.style}>
        <Icon component={HelpOutlineIcon as IAntIconComponent} style={{marginLeft: 4, transform: "scale(0.85) translateY(2px)", color: "#56CBF8"}}/>
      </Tooltip>
    );
  }
}
