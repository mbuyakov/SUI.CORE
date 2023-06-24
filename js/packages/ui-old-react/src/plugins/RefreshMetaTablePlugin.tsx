import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {Cached} from "@mui/icons-material";
import React from "react";

export class RefreshMetaTablePlugin extends React.Component<{
  handleClick(): Promise<void>;
}> {
  public render(): JSX.Element {
    return (
      <Plugin>
        <Template name="toolbarContent">
          <TemplatePlaceholder/>
          <TemplateConnector>
            {(): JSX.Element => (
              <Tooltip
                title='Обновить данные'
                placement='bottom'
                enterDelay={300}
              >
                <IconButton onClick={this.props.handleClick} size="large">
                  <Cached
                    // style={{color: '#1890ff'}}
                  />
                </IconButton>
              </Tooltip>
            )}
          </TemplateConnector>
        </Template>
      </Plugin>
    );
  }
}
