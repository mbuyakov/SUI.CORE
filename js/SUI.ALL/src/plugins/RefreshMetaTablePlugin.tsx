import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@devexpress/dx-react-core";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {Cached} from "@material-ui/icons";
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
                <IconButton
                  onClick={this.props.handleClick}
                >
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
