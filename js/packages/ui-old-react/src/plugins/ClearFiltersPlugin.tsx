import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {DeleteForever} from "@mui/icons-material";
import React from "react";

export class ClearFiltersPlugin extends React.Component<{
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
                title="Очистить фильтры"
                placement='bottom'
                enterDelay={300}
              >
                <IconButton onClick={this.props.handleClick} size="large">
                  <DeleteForever/>
                </IconButton>
              </Tooltip>
            )}
          </TemplateConnector>
        </Template>
      </Plugin>
    );
  }
}
