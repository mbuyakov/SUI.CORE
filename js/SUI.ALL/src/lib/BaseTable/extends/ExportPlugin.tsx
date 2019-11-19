import {Getters, Plugin, Template, TemplateConnector, TemplatePlaceholder} from '@devexpress/dx-react-core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloudDownload from '@material-ui/icons/CloudDownload';
import React from 'react';

export function ExportPlugin(props: { onClick(getters: Getters): void; }): JSX.Element {
  function tooltipFn(getters: Getters): JSX.Element {
    const onClick = () => props.onClick(getters);

    return (
      // tslint:disable-next-line:no-magic-numbers
      <Tooltip title='Выгрузка в Excel' placement='bottom' enterDelay={300}>
        <IconButton onClick={onClick}>
          <CloudDownload/>
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
