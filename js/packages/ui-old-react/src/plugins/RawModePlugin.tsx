import {MuiIcons, IconButton, Tooltip} from "@sui/deps-material";
import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import React from "react";

export class RawModePlugin extends React.Component<{
  enabled: boolean;
  onClick(): void;
}> {
  public render(): React.JSX.Element {
    return (
      <Plugin>
        <Template name="toolbarContent">
          <TemplatePlaceholder/>
          <TemplateConnector>
            {(): React.JSX.Element => (
              <Tooltip title='"Сырой" режим' placement='bottom' enterDelay={300}>
                <IconButton onClick={this.props.onClick} size="large">
                  <MuiIcons.BugReport style={this.props.enabled ? {color: "#ff4d4f"} : {}}/>
                </IconButton>
              </Tooltip>
            )}
          </TemplateConnector>
        </Template>
      </Plugin>
    );
  }
}
