import {Plugin, Template, TemplateConnector, TemplatePlaceholder} from '@devexpress/dx-react-core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloudDownload from '@material-ui/icons/CloudDownload';
import React from 'react';

export function ExportPlugin(props: { onClick(): void; }): JSX.Element {
  function tooltipFn(): JSX.Element {
    return (
      // tslint:disable-next-line:no-magic-numbers
      <Tooltip title='Выгрузка в Excel' placement='bottom' enterDelay={300}>
        <IconButton onClick={props.onClick}>
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
