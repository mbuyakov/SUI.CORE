import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Build from "@mui/icons-material/Build";
import autobind from "autobind-decorator";
import React from "react";

// noinspection ES6PreferShortImport
import {FullScreenModalClass} from "../FullScreenModal";
// noinspection ES6PreferShortImport
import {FullScreenTableSettings} from "../TableSettings";

interface ITableSettingsDialogProps {
  buttonStyle?: React.CSSProperties
  id: string
  style?: React.CSSProperties
}

export class TableSettingsDialog extends React.Component<ITableSettingsDialogProps> {

  private readonly dialogRef: React.RefObject<FullScreenModalClass> = React.createRef<FullScreenModalClass>();

  public render(): JSX.Element {
    return (
      <div style={this.props.style}>
        <Tooltip title='Редактировать права и видимость колонок' placement='bottom' enterDelay={300}>
          <IconButton
            style={this.props.buttonStyle}
            onClick={this.handleClickOpen}
            color="primary"
            size="large">
            <Build/>
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
