import {MuiIcons, IconButton, Tooltip} from "@sui/deps-material";
import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import React from "react";

export class ClearFiltersPlugin extends React.Component<{
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
                title="Очистить фильтры"
                placement='bottom'
                enterDelay={300}
              >
                <IconButton onClick={this.props.handleClick} size="large">
                  <MuiIcons.DeleteForever/>
                </IconButton>
              </Tooltip>
            )}
          </TemplateConnector>
        </Template>
      </Plugin>
    );
  }
}
