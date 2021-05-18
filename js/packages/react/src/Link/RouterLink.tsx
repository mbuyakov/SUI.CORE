import {ROUTER_LINK_BTN} from '@/styles';
import Button, {ButtonType} from 'antd/lib/button/button';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import * as React from 'react';
import {Link} from 'react-router-dom';

import {appendStateToLink, ITableStateDefinition} from "../BackendTable";

export type RouterLinkType = 'button' | 'button-primary' | 'link';

export interface IRouterLinkProps {
  buttonStyle?: React.CSSProperties;
  disabled?: boolean; // only for button type
  ghost?: boolean; // only for button type
  icon?: React.ReactNode;
  monospace?: boolean;
  size?: SizeType;
  style?: React.CSSProperties;
  tableStates?: {[tableId: string]: ITableStateDefinition};
  text?: React.ReactNode;
  to: string;
  type?: RouterLinkType;
}

export class RouterLink extends React.Component<IRouterLinkProps> {

  public render(): JSX.Element {
    return (
      <Link
        style={{...(this.props.monospace ? {fontFamily: 'monospace'} : {}), ...(this.props.style || {})}}
        to={this.props.tableStates
          ? appendStateToLink(this.props.to, this.props.tableStates)
          : this.props.to
        }
      >
        {(this.props.type && this.props.type.startsWith('button'))
          ? (
            <Button
              className={ROUTER_LINK_BTN}
              style={this.props.buttonStyle}
              size={this.props.size || "small"}
              type={this.props.type.replace('button-', '') as ButtonType}
              disabled={this.props.disabled}
              ghost={this.props.ghost}
              icon={this.props.icon}
            >
              {this.props.text || this.props.children}
            </Button>
          )
          : (this.props.text || this.props.children)
        }
      </Link>
    );
  }

}
