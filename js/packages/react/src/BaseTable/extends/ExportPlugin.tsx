import {Getters, Plugin, Template, TemplateConnector, TemplatePlaceholder} from '@devexpress/dx-react-core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';

export interface IExportPluginProps {
  icon: JSX.Element;
  tooltip: string;
  onClick(getters: Getters): Promise<void>;
}

export function ExportPlugin(props: IExportPluginProps): JSX.Element {
  function tooltipFn(getters: Getters): JSX.Element {
    const onClick = async () => props.onClick(getters);

    return (
      <Tooltip title={props.tooltip} placement='bottom' enterDelay={300}>
        <IconButton onClick={onClick}>
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
