import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from '@devexpress/dx-react-core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Build from '@material-ui/icons/Build';
import { FullScreenModal } from '@smsoft/sui-base-components';
import { FullScreenTableSettings } from '@smsoft/sui-meta';
import autobind from "autobind-decorator";
import React from 'react';

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
        {/* tslint:disable-next-line:no-magic-numbers */}
        <Tooltip title='Редактировать права и видимость колонок' placement='bottom' enterDelay={300}>
          <IconButton style={this.props.buttonStyle} onClick={this.handleClickOpen}>
            <Build style={{color: '#1890ff'}}/>
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

// tslint:disable-next-line:max-classes-per-file
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
