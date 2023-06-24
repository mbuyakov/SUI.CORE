import {IconButton} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import autobind from 'autobind-decorator';
import * as React from 'react';
import {RouteComponentProps, Router, withRouter} from 'react-router';

// noinspection ES6PreferShortImport
import {draw} from '../utils';

export interface IMaterialIconModalLinkProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any,
  modal: JSX.Element,
}

class __MaterialIconModalLink extends React.Component<IMaterialIconModalLinkProps & RouteComponentProps> {

  public render(): JSX.Element {
    return (
      <IconButton onClick={this.onClick} size="large">
        {this.props.icon || <LinkIcon/>}
      </IconButton>
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

export const MaterialIconModalLink: React.ComponentClass<IMaterialIconModalLinkProps> = withRouter(__MaterialIconModalLink);
