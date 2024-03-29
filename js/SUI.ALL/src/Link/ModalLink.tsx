import Button, {ButtonType} from 'antd/lib/button/button';
import autobind from 'autobind-decorator';
import * as React from 'react';
import { RouteComponentProps, Router, withRouter } from 'react-router';

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

export const ModalLink  = withRouter(__ModalLink);
