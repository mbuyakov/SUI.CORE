import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@devexpress/dx-react-core";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {DeleteForever} from '@material-ui/icons';
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
                <IconButton
                  onClick={this.props.handleClick}
                >
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
