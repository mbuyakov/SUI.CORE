import {MuiIcons, IconButton, Tooltip} from "@sui/deps-material";
import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import React from "react";

export class RefreshMetaTablePlugin extends React.Component<{
  handleClick(): Promise<void>;
}> {
  public render(): React.JSX.Element {
    return (
      <Plugin>
        <Template name="toolbarContent">
          <TemplatePlaceholder/>
          <TemplateConnector>
            {(): React.JSX.Element => (
              <Tooltip
                title='Обновить данные'
                placement='bottom'
                enterDelay={300}
              >
                <IconButton onClick={this.props.handleClick} size="large">
                  <MuiIcons.Cached
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
