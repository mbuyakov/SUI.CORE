import Button, {ButtonType} from 'antd/lib/button/button';
import * as React from 'react';
import {Link} from 'react-router-dom';

import {appendFiltersToLink, SimpleBackendFilter} from "../BackendTable";
import { ROUTER_LINK_BTN } from '../styles';
import {OneOrArray} from "../typeWrappers";

export type RouterLinkType = 'button' | 'button-primary' | 'link';

export interface IRouterLinkProps {
  buttonStyle?: React.CSSProperties;
  disabled?: boolean; // only for button type
  ghost?: boolean; // only for button type
  monospace?: boolean;
  style?: React.CSSProperties;
  tableFilters?: {[tableId: string]: OneOrArray<SimpleBackendFilter>}
  text: string | JSX.Element;
  to: string;
  type?: RouterLinkType;
}

export class RouterLink extends React.Component<IRouterLinkProps> {

  public render(): JSX.Element {
    return (
      <Link
        style={{...(this.props.monospace ? {fontFamily: 'monospace'} : {}), ...(this.props.style || {})}}
        to={this.props.tableFilters
          ? appendFiltersToLink(this.props.to, this.props.tableFilters)
          : this.props.to
        }
      >
        {(this.props.type && this.props.type.startsWith('button'))
          ? <Button
            className={ROUTER_LINK_BTN}
            style={this.props.buttonStyle}
            size="small"
            type={this.props.type.replace('button-', '') as ButtonType}
            disabled={this.props.disabled}
            ghost={this.props.ghost}
          >
            {this.props.text}
          </Button>
          : this.props.text}
      </Link>
    );
  }

}
