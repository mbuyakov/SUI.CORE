import {Getters, Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import {IconButton, Tooltip} from "@sui/deps-material";
import React from "react";

export interface IExportPluginProps {
  icon: React.JSX.Element;
  tooltip: string;

  onClick(getters: Getters): Promise<void>;
}

export function ExportPlugin(props: IExportPluginProps): React.JSX.Element {
  function tooltipFn(getters: Getters): React.JSX.Element {
    const onClick = async (): Promise<void> => props.onClick(getters);

    return (
      <Tooltip title={props.tooltip} placement='bottom' enterDelay={300}>
        <IconButton onClick={onClick} size="large">
          {props.icon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Plugin>
      <Template name="toolbarContent">
        <TemplatePlaceholder/>
        <TemplateConnector>
          {tooltipFn}
        </TemplateConnector>
      </Template>
    </Plugin>
  );
}
