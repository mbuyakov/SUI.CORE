import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import BugReport from "@mui/icons-material/BugReport";
import React from "react";

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
              <Tooltip title='"Сырой" режим' placement='bottom' enterDelay={300}>
                <IconButton onClick={this.props.onClick} size="large">
                  <BugReport style={this.props.enabled ? {color: "#ff4d4f"} : {}}/>
                </IconButton>
              </Tooltip>
            )}
          </TemplateConnector>
        </Template>
      </Plugin>
    );
  }
}
