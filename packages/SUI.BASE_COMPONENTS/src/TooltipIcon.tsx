import {Icon, Tooltip} from 'antd';
import * as React from 'react';

export class TooltipIcon extends React.Component<{
  style?: React.CSSProperties;
}> {
  public render(): JSX.Element {
    return (
      <Tooltip title={this.props.children} overlayStyle={this.props.style}>
        <Icon
          style={{marginLeft: 4}}
          type="question-circle"
          theme="twoTone"
        />
      </Tooltip>
    );
  }
}
