import Button, { ButtonType } from 'antd/lib/button/button';
import * as React from 'react';
import { Link } from 'react-router-dom';

export type RouterLinkType = 'button' | 'button-primary' | 'link';

export interface IRouterLinkProps {
  buttonStyle?: React.CSSProperties;
  disabled?: boolean; // only for button type
  monospace?: boolean;
  style?: React.CSSProperties;
  text: string | JSX.Element;
  to: string;
  type?: RouterLinkType;
}

export class RouterLink extends React.Component<IRouterLinkProps> {
  public render(): JSX.Element {
    return (
      <Link
        style={{ ...(this.props.monospace ? { fontFamily: 'monospace' } : {}), ...(this.props.style || {}) }}
        to={this.props.to}
      >
        {(this.props.type && this.props.type.startsWith('button'))
          ? <Button
            style={this.props.buttonStyle}
            size="small"
            type={this.props.type.replace('button-', '') as ButtonType}
            disabled={this.props.disabled}
          >
            {this.props.text}
          </Button>
          : this.props.text}
      </Link>
    );
  }
}