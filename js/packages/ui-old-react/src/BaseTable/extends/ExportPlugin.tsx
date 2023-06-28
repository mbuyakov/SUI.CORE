import {Getters, Plugin, Template, TemplateConnector, TemplatePlaceholder} from "@sui/deps-dx-react-grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

export interface IExportPluginProps {
  icon: JSX.Element;
  tooltip: string;

  onClick(getters: Getters): Promise<void>;
}

export function ExportPlugin(props: IExportPluginProps): JSX.Element {
  function tooltipFn(getters: Getters): JSX.Element {
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
