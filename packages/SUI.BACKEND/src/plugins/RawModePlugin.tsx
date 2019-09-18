import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from '@devexpress/dx-react-core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import BugReport from '@material-ui/icons/BugReport';
import React from 'react';

export class RawModePlugin extends React.Component<{
  enabled: boolean;
  onClick(): void;
}> {

  public render(): JSX.Element {
    return (
      <Plugin>
        <Template name="toolbarContent">
          <TemplatePlaceholder/>
          <TemplateConnector>
            {(): JSX.Element => (
              // tslint:disable-next-line:no-magic-numbers
              <Tooltip title='"Сырой" режим' placement='bottom' enterDelay={300}>
                <IconButton onClick={this.props.onClick}>
                  <BugReport style={this.props.enabled ? {color: '#ff4d4f'} : {}}/>
                </IconButton>
              </Tooltip>
            )}
          </TemplateConnector>
        </Template>
      </Plugin>
    );
  }

}
