import Button, {ButtonType} from 'antd/lib/button/button';
import * as React from 'react';

import {RouterLinkType} from "./RouterLink";

interface IExternalLinkProps {
  ghost?: boolean;
  text: string;
  to: string;
  type?: RouterLinkType;
}

export class ExternalLink extends React.Component<IExternalLinkProps> {

  public render(): JSX.Element {
    return (
      <a
        href={this.props.to}
        target="_blank"
      >
        {(this.props.type && this.props.type.startsWith('button'))
          ? (
            <Button
              href={undefined}
              size="small"
              type={this.props.type.replace('button-', '') as ButtonType}
              ghost={this.props.ghost}>
              {this.props.text}
            </Button>
          ) : this.props.text}
      </a>
    );
  }

}
