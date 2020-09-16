import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from '@devexpress/dx-react-core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Build from '@material-ui/icons/Build';
import autobind from "autobind-decorator";
import React from 'react';

import { FullScreenModal } from '../FullScreenModal';
import { FullScreenTableSettings } from '../TableSettings';

interface ITableSettingsDialogProps {
  buttonStyle?: React.CSSProperties
  id: string
  style?: React.CSSProperties
}

export class TableSettingsDialog extends React.Component<ITableSettingsDialogProps> {

  private readonly dialogRef: React.RefObject<FullScreenModal> = React.createRef<FullScreenModal>();

  public render(): JSX.Element {
    return (
      <div style={this.props.style}>
        <Tooltip title='Редактировать права и видимость колонок' placement='bottom' enterDelay={300}>
          <IconButton style={this.props.buttonStyle} onClick={this.handleClickOpen} color="primary">
            <Build style={{color: '#56CBF8'}}/>
          </IconButton>
        </Tooltip>
        <FullScreenTableSettings
          dialogRef={this.dialogRef}
          id={this.props.id}
        />
      </div>
    );
  }

  @autobind
  private handleClickOpen(): void {
    if (this.dialogRef.current) {
      this.dialogRef.current.open();
    }
  }
}

export class TableSettingsPlugin extends React.Component<{
  id: string;
}> {
  public render(): JSX.Element {
    return (
      <Plugin>
        <Template name="toolbarContent">
          <TemplatePlaceholder/>
          <TemplateConnector>
            {(): JSX.Element => (
              <TableSettingsDialog id={this.props.id}/>
            )}
          </TemplateConnector>
        </Template>
      </Plugin>
    );
  }
}
