import Button, {ButtonType} from 'antd/lib/button/button';
import autobind from 'autobind-decorator';
import * as React from 'react';

import { draw } from '../utils';


export interface IModalLinkProps {
  ghost?: boolean,
  modal: JSX.Element,
  text: string,
  type?: ButtonType,
}

export class ModalLink extends React.Component<IModalLinkProps> {

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
    draw(this.props.modal);
  }
}
