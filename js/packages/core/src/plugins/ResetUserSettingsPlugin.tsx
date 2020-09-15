/* tslint:disable:no-magic-numbers */
import {Getters, Plugin, Template, TemplateConnector, TemplatePlaceholder} from '@devexpress/dx-react-core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import React from 'react';

export interface IResetUserSettingsPluginProps {
  onClick(getters: Getters): void | Promise<void>;
}

export function ResetUserSettingsPlugin(props: IResetUserSettingsPluginProps): JSX.Element {
  return (
    <Plugin>
      <Template name="toolbarContent">
        <TemplatePlaceholder/>
        <TemplateConnector>
          {(getters: Getters): JSX.Element => {
            const onClick = (): void | Promise<void> => props.onClick(getters);

            return (
              <Tooltip
                title="Сбросить таблицу к виду по умолчанию"
                placement="bottom"
                enterDelay={300}
              >
                <IconButton onClick={onClick}>
                  <RotateLeftIcon/>
                </IconButton>
              </Tooltip>
            );
          }}
        </TemplateConnector>
      </Template>
    </Plugin>
  );
}
