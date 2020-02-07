// tslint:disable:max-classes-per-file class-name variable-name
import {Router} from "@material-ui/icons";
import Button, {ButtonType} from 'antd/lib/button/button';
import autobind from 'autobind-decorator';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { draw } from '../utils';


export interface IModalLinkProps {
  ghost?: boolean,
  modal: JSX.Element,
  text: string | JSX.Element,
  type?: ButtonType,
}

class __ModalLink extends React.Component<IModalLinkProps & RouteComponentProps> {

  public render(): JSX.Element {
    return (
      <Button
        ghost={this.props.ghost}
        size="small"
        type={this.props.type}
        onClick={this.onClick}
      >
        {this.props.text}
      </Button>
    );
  }

  @autobind
  private onClick(): void {
    draw(
      <Router
        {...this.props}
      >
        {this.props.modal}
      </Router>
    );
  }

}

export class ModalLink extends React.Component<IModalLinkProps>{

  public render(): JSX.Element {
    return React.createElement(withRouter(__ModalLink), this.props)
  }

}
